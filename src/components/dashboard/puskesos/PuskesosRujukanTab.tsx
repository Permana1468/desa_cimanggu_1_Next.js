"use client";

import { useState, useEffect } from "react";
import { getPuskesosRujukan, createPuskesosRujukan } from "@/actions/puskesos";
import { FileText, Search, Plus } from "lucide-react";

export function PuskesosRujukanTab({ session }: { session: any }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nik: "", instansiTujuan: "", nomorSuratRujukan: "", keteranganRujukan: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tenantId = session?.user?.tenantId || "cimanggu-1";

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await getPuskesosRujukan(tenantId);
      setData(res);
    } catch (error) {
      alert("Gagal memuat data rujukan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.instansiTujuan?.toLowerCase().includes(search.toLowerCase()) ||
    item.warga?.namaLengkap?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createPuskesosRujukan({ ...formData, tenantId });
      alert("Rujukan berhasil dibuat");
      setIsModalOpen(false);
      setFormData({ nik: "", instansiTujuan: "", nomorSuratRujukan: "", keteranganRujukan: "" });
      fetchData();
    } catch (error: any) {
      alert(error.message || "Gagal membuat rujukan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen Rujukan (SLRT)</h2>
          <p className="text-slate-500 text-sm">Kelola Surat Layanan Rujukan Terpadu (Kesehatan, Sosial, dll).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus size={18} /> Buat Rujukan Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari warga atau instansi..." 
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
                <th className="px-6 py-4 font-bold">No. Surat</th>
                <th className="px-6 py-4 font-bold">Warga</th>
                <th className="px-6 py-4 font-bold">Instansi Tujuan</th>
                <th className="px-6 py-4 font-bold">Keterangan</th>
                <th className="px-6 py-4 font-bold">Tanggal</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-semibold text-slate-600">Belum ada rujukan</p>
                    <p className="text-xs">Surat rujukan yang dibuat akan tampil di sini.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {item.nomorSuratRujukan || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.warga?.namaLengkap || "Anonim"}</div>
                      <div className="text-xs text-slate-500 mt-1">NIK: {item.warga?.nik}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{item.instansiTujuan}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 line-clamp-2 max-w-xs text-xs">{item.keteranganRujukan}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap
                        ${item.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' : 
                          item.status === 'DIKIRIM' ? 'bg-blue-100 text-blue-700' : 
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
              <h3 className="font-bold text-lg">Buat Surat Rujukan Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">NIK Warga Dirujuk</label>
                <input 
                  required
                  type="text"
                  placeholder="Masukkan 16 digit NIK"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  value={formData.nik}
                  onChange={(e) => setFormData({...formData, nik: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Instansi Tujuan</label>
                <input 
                  required
                  type="text"
                  placeholder="Contoh: RSUD Cibinong / Dinas Sosial"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  value={formData.instansiTujuan}
                  onChange={(e) => setFormData({...formData, instansiTujuan: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nomor Surat (Opsional)</label>
                <input 
                  type="text"
                  placeholder="Contoh: 460/01/PUSKESOS/2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  value={formData.nomorSuratRujukan}
                  onChange={(e) => setFormData({...formData, nomorSuratRujukan: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Keterangan / Alasan Rujukan</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Tuliskan keterangan detail rujukan..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  value={formData.keteranganRujukan}
                  onChange={(e) => setFormData({...formData, keteranganRujukan: e.target.value})}
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-2">
                  {isSubmitting ? "Menyimpan..." : "Simpan Rujukan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
