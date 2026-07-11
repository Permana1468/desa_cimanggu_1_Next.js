"use client";

import { useState, useEffect } from "react";
import { getPuskesosKegiatan, createPuskesosKegiatan } from "@/actions/puskesos";
import { HeartHandshake, Search, Plus, MapPin, Calendar } from "lucide-react";

export function PuskesosPpksTab({ session }: { session: any }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ namaKegiatan: "", jenisKegiatan: "", lokasi: "", tanggal: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tenantId = session?.user?.tenantId || "cimanggu-1";

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getPuskesosKegiatan(tenantId);
      setData(res);
    } catch (error) {
      alert("Gagal memuat data PPKS & Kegiatan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createPuskesosKegiatan({ ...formData, tenantId });
      alert("Kegiatan/Jadwal berhasil ditambahkan");
      setIsModalOpen(false);
      setFormData({ namaKegiatan: "", jenisKegiatan: "", lokasi: "", tanggal: "" });
      fetchData();
    } catch (error) {
      alert("Gagal menambahkan kegiatan");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.namaKegiatan?.toLowerCase().includes(search.toLowerCase()) ||
    item.lokasi?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">PPKS & Penjangkauan</h2>
          <p className="text-slate-500 text-sm">Daftar agenda penjangkauan, survei lapangan, dan kegiatan sosial.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus size={18} /> Tambah Kegiatan
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama kegiatan atau lokasi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">Nama Kegiatan</th>
                <th className="px-6 py-4 font-bold">Kategori</th>
                <th className="px-6 py-4 font-bold">Lokasi</th>
                <th className="px-6 py-4 font-bold">Jadwal Pelaksanaan</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <HeartHandshake size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-semibold text-slate-600">Belum ada kegiatan/penjangkauan</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.namaKegiatan}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap">
                        {item.jenisKegiatan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <MapPin size={14} className="text-slate-400" />
                        {item.lokasi || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 whitespace-nowrap">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap
                        ${item.status === 'RENCANA' ? 'bg-amber-100 text-amber-700' : 
                          item.status === 'BERJALAN' ? 'bg-blue-100 text-blue-700' : 
                          'bg-emerald-100 text-emerald-700'}`}
                      >
                        {item.status}
                      </span>
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
              <h3 className="font-bold text-lg">Tambah Kegiatan / Jadwal Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Kegiatan</label>
                <input 
                  required
                  type="text"
                  placeholder="Contoh: Survei Lansia Miskin"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  value={formData.namaKegiatan}
                  onChange={(e) => setFormData({...formData, namaKegiatan: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Jenis Kegiatan</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  value={formData.jenisKegiatan}
                  onChange={(e) => setFormData({...formData, jenisKegiatan: e.target.value})}
                >
                  <option value="">Pilih Jenis...</option>
                  <option value="SURVEI_LAPANGAN">Survei Lapangan</option>
                  <option value="PENJANGKAUAN">Penjangkauan (Outreach)</option>
                  <option value="DISTRIBUSI_BANTUAN">Distribusi Bantuan</option>
                  <option value="RAPAT_KOORDINASI">Rapat Koordinasi</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Lokasi / Keterangan</label>
                <input 
                  type="text"
                  placeholder="Contoh: Kp. Bojong Galeuh RT 01/RW 09"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tanggal Kegiatan</label>
                <input 
                  required
                  type="date"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all flex items-center gap-2">
                  {isSubmitting ? "Menyimpan..." : "Simpan Kegiatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
