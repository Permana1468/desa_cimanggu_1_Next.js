"use client";

import { useState, useEffect } from "react";
import { 
  getPuskesosPengaduan, 
  updateStatusPengaduan, 
  createPuskesosPengaduan,
  createPuskesosRujukan,
  generateNomorRujukan
} from "@/actions/puskesos";
import { 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRightCircle, 
  AlertCircle,
  FileText
} from "lucide-react";
import { CitizenSearchInput } from "./CitizenSearchInput";

export function PuskesosPengaduanTab({ session }: { session: any }) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nik: "", jenisPengaduan: "", deskripsi: "" });
  const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Eskalasi ke Rujukan SLRT
  const [rujukModalOpen, setRujukModalOpen] = useState(false);
  const [activeAduanToRujuk, setActiveAduanToRujuk] = useState<any>(null);
  const [rujukForm, setRujukForm] = useState({
    instansiTujuan: "",
    nomorSuratRujukan: "",
    keteranganRujukan: ""
  });

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
      fetchData();
    } catch (error) {
      alert("Gagal memperbarui status");
    }
  };

  const handleOpenRujukModal = async (aduan: any) => {
    setActiveAduanToRujuk(aduan);
    const autoNo = await generateNomorRujukan(tenantId);
    setRujukForm({
      instansiTujuan: aduan.jenisPengaduan === "KESEHATAN" ? "RSUD Leuwiliang" : "Dinas Sosial Kab. Bogor",
      nomorSuratRujukan: autoNo,
      keteranganRujukan: `Tindak lanjut aduan: ${aduan.deskripsi}`
    });
    setRujukModalOpen(true);
  };

  const handleSumbitRujuk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAduanToRujuk) return;
    try {
      setIsSubmitting(true);
      await createPuskesosRujukan({
        pengaduanId: activeAduanToRujuk.id,
        wargaId: activeAduanToRujuk.wargaId,
        instansiTujuan: rujukForm.instansiTujuan,
        nomorSuratRujukan: rujukForm.nomorSuratRujukan,
        keteranganRujukan: rujukForm.keteranganRujukan,
        tenantId
      });
      // Update status aduan menjadi DIPROSES / RUJUKAN
      await updateStatusPengaduan(activeAduanToRujuk.id, "DIPROSES");
      alert("Pengaduan berhasil dieskalasi menjadi Surat Rujukan SLRT!");
      setRujukModalOpen(false);
      setActiveAduanToRujuk(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal membuat rujukan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = data.filter(item => 
    item.deskripsi?.toLowerCase().includes(search.toLowerCase()) ||
    item.warga?.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
    item.jenisPengaduan?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nik) {
      alert("Silakan pilih warga pelapor dari data kependudukan.");
      return;
    }
    try {
      setIsSubmitting(true);
      await createPuskesosPengaduan({ 
        ...formData, 
        wargaId: selectedCitizen?.id,
        tenantId 
      });
      alert("Pengaduan masyarakat berhasil dicatat ke sistem SLRT!");
      setIsModalOpen(false);
      setFormData({ nik: "", jenisPengaduan: "", deskripsi: "" });
      setSelectedCitizen(null);
      fetchData();
    } catch (error: any) {
      alert(error.message || "Gagal menambahkan pengaduan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-100">
            Front Office & Helpdesk SLRT
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-2">Layanan Pengaduan & Keluhan Sosial</h2>
          <p className="text-slate-500 text-sm">Registrasi dan penanganan keluhan bansos, kesehatan, kedaruratan, dan PPKS warga Cimanggu I.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus size={16} /> Catat Pengaduan Baru
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama warga, jenis aduan, atau masalah..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none text-xs bg-white"
            />
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Total Terdaftar: <strong className="text-slate-800">{filteredData.length}</strong> Aduan
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-bold">Warga / Pelapor</th>
                <th className="px-5 py-3.5 font-bold">Kategori</th>
                <th className="px-5 py-3.5 font-bold">Deskripsi Keluhan</th>
                <th className="px-5 py-3.5 font-bold">Tanggal Masuk</th>
                <th className="px-5 py-3.5 font-bold text-center">Status</th>
                <th className="px-5 py-3.5 font-bold text-center">Tindakan SLRT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="font-medium text-xs">Memuat data pengaduan...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <MessageSquare size={42} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-bold text-slate-700 text-sm">Belum ada pengaduan tercatat</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol &apos;Catat Pengaduan Baru&apos; di atas untuk input laporan.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800 text-sm">{item.warga?.namaLengkap || "Anonim"}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        NIK: {item.warga?.nik} • RT {item.warga?.rt || "-"}/RW {item.warga?.rw || "-"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap">
                        {item.jenisPengaduan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-600 line-clamp-2 max-w-xs">{item.deskripsi}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.tanggalMasuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap inline-flex items-center gap-1
                        ${item.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                          item.status === 'DIPROSES' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                          'bg-amber-100 text-amber-800 border border-amber-200'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Tombol Buat Rujukan SLRT */}
                        <button
                          onClick={() => handleOpenRujukModal(item)}
                          title="Teruskan ke Rujukan SLRT"
                          className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <ArrowRightCircle size={13} /> Rujuk SLRT
                        </button>

                        {/* Status updates */}
                        {item.status === 'MENUNGGU' && (
                          <button 
                            onClick={() => handleUpdateStatus(item.id, 'DIPROSES')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Proses
                          </button>
                        )}
                        {item.status === 'DIPROSES' && (
                          <button 
                            onClick={() => handleUpdateStatus(item.id, 'SELESAI')}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} /> Selesai
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

      {/* MODAL INPUT PENGADUAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-900 text-base">Catat Pengaduan Masyarakat</h3>
                <p className="text-xs text-slate-500 mt-0.5">Penerimaan aspirasi & kendala kesejahteraan sosial</p>
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
                  Warga Pelapor / Korban (Terintegrasi Kependudukan) *
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Bidang Pengaduan *</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                  value={formData.jenisPengaduan}
                  onChange={(e) => setFormData({...formData, jenisPengaduan: e.target.value})}
                >
                  <option value="">Pilih Kategori...</option>
                  <option value="BANSOS">Bantuan Sosial (PKH, BPNT, BLT-DD)</option>
                  <option value="KESEHATAN">Kesehatan & BPJS / UHC</option>
                  <option value="PENDIDIKAN">Pendidikan & Anak Putus Sekolah (ATS)</option>
                  <option value="DISABILITAS">Penyandang Disabilitas & Lansia Terlantar</option>
                  <option value="KEDARURATAN">Kedaruratan & Bencana Sosial</option>
                  <option value="LAINNYA">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi Masalah Lengkap *</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Tuliskan keluhan warga, kronologi, serta kebutuhan bantuan..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
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
                  className="px-5 py-2.5 font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengaduan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ESKALASI KE RUJUKAN SLRT */}
      {rujukModalOpen && activeAduanToRujuk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-blue-50">
              <div>
                <h3 className="font-black text-slate-900 text-base">Eskalasi ke Rujukan Resmi SLRT</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Teruskan aduan warga {activeAduanToRujuk.warga?.namaLengkap} ke instansi terkait
                </p>
              </div>
              <button 
                onClick={() => setRujukModalOpen(false)} 
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSumbitRujuk} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pasien / Penerima Rujukan</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-bold">
                  {activeAduanToRujuk.warga?.namaLengkap} ({activeAduanToRujuk.warga?.nik})
                  <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                    {activeAduanToRujuk.warga?.alamat || "Desa Cimanggu I"} RT {activeAduanToRujuk.warga?.rt}/RW {activeAduanToRujuk.warga?.rw}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Surat Rujukan</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-blue-700"
                  value={rujukForm.nomorSuratRujukan}
                  onChange={(e) => setRujukForm({ ...rujukForm, nomorSuratRujukan: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Instansi Tujuan</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: RSUD Leuwiliang / Dinas Sosial"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  value={rujukForm.instansiTujuan}
                  onChange={(e) => setRujukForm({ ...rujukForm, instansiTujuan: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Keterangan / Alasan Rujukan</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  value={rujukForm.keteranganRujukan}
                  onChange={(e) => setRujukForm({ ...rujukForm, keteranganRujukan: e.target.value })}
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setRujukModalOpen(false)} 
                  className="px-4 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Memproses..." : "Terbitkan Rujukan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
