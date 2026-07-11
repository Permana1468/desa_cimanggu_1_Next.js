"use client";

import { useState, useEffect } from "react";
import { getPuskesosPengaduan, updateStatusPengaduan, createPuskesosPengaduan } from "@/actions/puskesos";
import { MessageSquare, Search, Filter, AlertCircle, Clock, CheckCircle2, Plus } from "lucide-react";

export function PuskesosPengaduanTab({ session }: { session: any }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nik: "", jenisPengaduan: "", deskripsi: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tenantId = session?.user?.tenantId || "cimanggu-1";

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getPuskesosPengaduan(tenantId);
      setData(res);
    } catch (error) {
      alert("Gagal memuat data pengaduan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateStatusPengaduan(id, newStatus);
      alert("Status pengaduan berhasil diperbarui!");
      fetchData();
    } catch (error) {
      alert("Gagal memperbarui status");
    }
  };

  const filteredData = data.filter(item => 
    item.deskripsi?.toLowerCase().includes(search.toLowerCase()) ||
    item.warga?.namaLengkap?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createPuskesosPengaduan({ ...formData, tenantId });
      alert("Pengaduan berhasil ditambahkan");
      setIsModalOpen(false);
      setFormData({ nik: "", jenisPengaduan: "", deskripsi: "" });
      fetchData();
    } catch (error: any) {
      alert(error.message || "Gagal menambahkan pengaduan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Layanan Pengaduan</h2>
          <p className="text-slate-500 text-sm">Kelola keluhan dan aduan masyarakat (PPKS/Kesejahteraan).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus size={18} /> Tambah Pengaduan
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau deskripsi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">Warga / Pelapor</th>
                <th className="px-6 py-4 font-bold">Kategori</th>
                <th className="px-6 py-4 font-bold">Deskripsi</th>
                <th className="px-6 py-4 font-bold">Tanggal Masuk</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-semibold text-slate-600">Belum ada pengaduan</p>
                    <p className="text-xs">Pengaduan yang masuk akan tampil di sini.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.warga?.namaLengkap || "Anonim"}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {item.warga?.alamat} RT {item.warga?.rt}/RW {item.warga?.rw}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
                        {item.jenisPengaduan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 line-clamp-2 max-w-xs">{item.deskripsi}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 whitespace-nowrap">
                        {new Date(item.tanggalMasuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(item.tanggalMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap
                        ${item.status === 'MENUNGGU' ? 'bg-amber-100 text-amber-700' : 
                          item.status === 'DIPROSES' ? 'bg-blue-100 text-blue-700' : 
                          'bg-emerald-100 text-emerald-700'}`}
                      >
                        {item.status === 'MENUNGGU' ? <Clock size={12} /> : 
                         item.status === 'DIPROSES' ? <AlertCircle size={12} /> : 
                         <CheckCircle2 size={12} />}
                        {item.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {item.status === 'MENUNGGU' && (
                          <button 
                            onClick={() => handleUpdateStatus(item.id, 'DIPROSES')}
                            className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                          >
                            Proses
                          </button>
                        )}
                        {item.status === 'DIPROSES' && (
                          <button 
                            onClick={() => handleUpdateStatus(item.id, 'SELESAI')}
                            className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Catat Pengaduan Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">NIK Pelapor / Warga</label>
                <input 
                  required
                  type="text"
                  placeholder="Masukkan 16 digit NIK"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  value={formData.nik}
                  onChange={(e) => setFormData({...formData, nik: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Jenis / Kategori</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  value={formData.jenisPengaduan}
                  onChange={(e) => setFormData({...formData, jenisPengaduan: e.target.value})}
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="BANSOS">Masalah Bansos (PKH/BPNT)</option>
                  <option value="KESEHATAN">Bantuan Kesehatan (KMS/BPJS)</option>
                  <option value="KEMISKINAN">Surat Keterangan Tidak Mampu</option>
                  <option value="DISABILITAS">Bantuan Disabilitas/Lansia</option>
                  <option value="LAINNYA">Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi Keluhan</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Tuliskan keluhan secara detail..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all flex items-center gap-2">
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengaduan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
