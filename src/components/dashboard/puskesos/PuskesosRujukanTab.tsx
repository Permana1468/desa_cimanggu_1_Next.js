"use client";

import { useState, useEffect } from "react";
import { 
  getPuskesosRujukan, 
  createPuskesosRujukan, 
  updateStatusRujukan, 
  deletePuskesosRujukan, 
  generateNomorRujukan 
} from "@/actions/puskesos";
import { FileText, Search, Plus, Printer, Trash2, CheckCircle2, Send, ExternalLink } from "lucide-react";
import { CitizenSearchInput } from "./CitizenSearchInput";
import { ModalCetakRujukan } from "./ModalCetakRujukan";

export function PuskesosRujukanTab({ session }: { session: any }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRujukanForPrint, setSelectedRujukanForPrint] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    nik: "", 
    instansiTujuan: "", 
    nomorSuratRujukan: "", 
    keteranganRujukan: "" 
  });
  const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
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

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    try {
      const autoNo = await generateNomorRujukan(tenantId);
      setFormData(prev => ({ ...prev, nomorSuratRujukan: autoNo }));
    } catch (e) {
      console.warn("Gagal generate no surat otomatis:", e);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatusRujukan(id, newStatus);
      fetchData();
    } catch (e) {
      alert("Gagal memperbarui status rujukan");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus surat rujukan ini?")) {
      try {
        await deletePuskesosRujukan(id);
        fetchData();
      } catch (e) {
        alert("Gagal menghapus rujukan");
      }
    }
  };

  const filteredData = data.filter(item => 
    item.instansiTujuan?.toLowerCase().includes(search.toLowerCase()) ||
    item.warga?.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
    item.nomorSuratRujukan?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nik) {
      alert("Silakan pilih warga dari data sensus kependudukan.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createPuskesosRujukan({ 
        ...formData, 
        wargaId: selectedCitizen?.id,
        tenantId 
      });
      alert("Surat rujukan berhasil diterbitkan!");
      setIsModalOpen(false);
      setFormData({ nik: "", instansiTujuan: "", nomorSuratRujukan: "", keteranganRujukan: "" });
      setSelectedCitizen(null);
      fetchData();
    } catch (error: any) {
      alert(error.message || "Gagal membuat rujukan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-blue-100">
            Sistem Layanan Rujukan Terpadu (SLRT)
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-2">Manajemen Rujukan Pasien & PPKS</h2>
          <p className="text-slate-500 text-sm">Penerbitan surat pengantar rujukan sosial & kesehatan ke RSUD, Puskesmas, dan Dinas Sosial.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all shrink-0"
        >
          <Plus size={16} /> Buat Surat Rujukan Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama warga, nomor surat, atau instansi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs bg-white"
            />
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Total Terbit: <strong className="text-slate-800">{filteredData.length}</strong> Rujukan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-bold">No. Surat</th>
                <th className="px-5 py-3.5 font-bold">Warga Pasien</th>
                <th className="px-5 py-3.5 font-bold">Instansi Tujuan</th>
                <th className="px-5 py-3.5 font-bold">Keterangan / Diagnosa</th>
                <th className="px-5 py-3.5 font-bold">Tanggal</th>
                <th className="px-5 py-3.5 font-bold text-center">Status</th>
                <th className="px-5 py-3.5 font-bold text-center">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="font-medium text-xs">Memuat data rujukan...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <FileText size={42} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-bold text-slate-700 text-sm">Belum ada rujukan diterbitkan</p>
                    <p className="text-xs text-slate-400 mt-1">Klik tombol &apos;Buat Surat Rujukan Baru&apos; di atas untuk menerbitkan.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-blue-700">
                      {item.nomorSuratRujukan || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800 text-sm">{item.warga?.namaLengkap || "Anonim"}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">NIK: {item.warga?.nik}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                        {item.instansiTujuan}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-600 line-clamp-2 max-w-xs">{item.keteranganRujukan}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap inline-flex items-center gap-1
                        ${item.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                          item.status === 'DIKIRIM' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                          item.status === 'DICETAK' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Tombol Cetak Lembar Rujukan */}
                        <button
                          onClick={() => setSelectedRujukanForPrint(item)}
                          title="Cetak Surat Rujukan Resmi"
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Printer size={13} /> Cetak
                        </button>

                        {/* Status toggles */}
                        {item.status === "DRAFT" && (
                          <button
                            onClick={() => handleStatusChange(item.id, "DIKIRIM")}
                            title="Tandai Sudah Dikirim ke Instansi"
                            className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Send size={13} /> Kirim
                          </button>
                        )}

                        {item.status === "DIKIRIM" && (
                          <button
                            onClick={() => handleStatusChange(item.id, "SELESAI")}
                            title="Tandai Selesai Penanganan"
                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 size={13} /> Selesai
                          </button>
                        )}

                        {/* Hapus */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Hapus Rujukan"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BUAT RUJUKAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-base">Terbitkan Surat Rujukan SLRT</h3>
                <p className="text-xs text-slate-500 mt-0.5">Rujukan resmi jaminan kesehatan & sosial terpadu</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Warga / Pasien (Terintegrasi Kependudukan) *
                </label>
                <CitizenSearchInput
                  tenantId={tenantId}
                  onSelect={(citizen) => {
                    setSelectedCitizen(citizen);
                    setFormData(prev => ({ ...prev, nik: citizen ? citizen.nik : "" }));
                  }}
                  placeholder="Ketik NIK atau Nama warga Cimanggu I..."
                  required={true}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Surat Rujukan *</label>
                <input 
                  required
                  type="text"
                  placeholder="Contoh: 460/SLRT-CMG1/001/2026"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs font-bold text-blue-700"
                  value={formData.nomorSuratRujukan}
                  onChange={(e) => setFormData({...formData, nomorSuratRujukan: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Instansi Tujuan Rujukan *</label>
                <input 
                  required
                  type="text"
                  placeholder="Contoh: RSUD Leuwiliang / Dinas Sosial Kab. Bogor / Puskesmas"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  value={formData.instansiTujuan}
                  onChange={(e) => setFormData({...formData, instansiTujuan: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Keterangan / Alasan Rujukan & Diagnosa *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Tuliskan indikasi masalah sosial/medis pasien dan alasan butuh rujukan..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  value={formData.keteranganRujukan}
                  onChange={(e) => setFormData({...formData, keteranganRujukan: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Terbitkan Rujukan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK LEMBAR RUJUKAN RESMI */}
      {selectedRujukanForPrint && (
        <ModalCetakRujukan
          rujukan={selectedRujukanForPrint}
          onClose={() => setSelectedRujukanForPrint(null)}
          onStatusUpdated={fetchData}
        />
      )}
    </div>
  );
}
