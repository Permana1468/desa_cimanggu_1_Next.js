"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  Search, 
  Download, 
  Lock, 
  Key,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { 
  getBukuTamuList, 
  createBukuTamu, 
  BukuTamuItem 
} from "@/actions/pelayanan";

export function LayananUmum({ session, tab }: { session: any, tab: string }) {
  // Buku Tamu State
  const [bukuTamuList, setBukuTamuList] = useState<BukuTamuItem[]>([]);
  const [searchTamu, setSearchTamu] = useState("");
  const [loadingTamu, setLoadingTamu] = useState(false);

  // Modal Catat Tamu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    instansi: "",
    keperluan: "",
    nomorHp: "",
    penerima: "Kasi Pelayanan Desa Cimanggu I",
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchBukuTamu = useCallback(async () => {
    setLoadingTamu(true);
    const res = await getBukuTamuList(searchTamu);
    if (res.success) {
      setBukuTamuList(res.data);
    }
    setLoadingTamu(false);
  }, [searchTamu]);

  useEffect(() => {
    if (tab === "buku-tamu") {
      fetchBukuTamu();
    }
  }, [tab, fetchBukuTamu]);

  const handleCreateTamu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.instansi.trim() || !formData.keperluan.trim()) {
      return;
    }

    setSubmitting(true);
    const res = await createBukuTamu(formData);
    setSubmitting(false);

    if (res.success && res.item) {
      setIsModalOpen(false);
      setFormData({
        nama: "",
        instansi: "",
        keperluan: "",
        nomorHp: "",
        penerima: "Kasi Pelayanan Desa Cimanggu I",
      });
      fetchBukuTamu();
      setToastMsg(`Buku tamu atas nama ${res.item.nama} berhasil dicatat.`);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const handleExportCSV = () => {
    if (bukuTamuList.length === 0) return;
    const headers = ["ID", "Tanggal", "Jam", "Nama Tamu", "Instansi", "Keperluan", "No HP", "Penerima"];
    const rows = bukuTamuList.map((item) => [
      item.id,
      item.tanggal,
      item.jam,
      `"${item.nama.replace(/"/g, '""')}"`,
      `"${item.instansi.replace(/"/g, '""')}"`,
      `"${item.keperluan.replace(/"/g, '""')}"`,
      `"${item.nomorHp}"`,
      `"${item.penerima.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `buku_tamu_pelayanan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-sm font-bold"
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800">Layanan Umum & Buku Tamu</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
              Desa Cimanggu I
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Buku tamu digital kedinasan, pelaporan rekapitulasi, dan sertifikasi TTE resmi.
          </p>
        </div>

        {tab === "buku-tamu" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              <Plus size={16} />
              <span>+ Catat Tamu Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: BUKU TAMU */}
      {tab === "buku-tamu" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-blue-600" />
                <span>Buku Tamu Kedinasan Digital</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar kunjungan instansi, pejabat dinas, dan tamu resmi Seksi Pelayanan.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari nama, instansi, atau keperluan..."
                  value={searchTamu}
                  onChange={(e) => setSearchTamu(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={handleExportCSV}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 text-xs font-bold"
                title="Unduh Excel/CSV"
              >
                <Download size={15} />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="py-4 px-6">Waktu Kunjungan</th>
                  <th className="py-4 px-6">Nama Tamu & Jabatan</th>
                  <th className="py-4 px-6">Instansi / Asal</th>
                  <th className="py-4 px-6">Keperluan Kedinasan</th>
                  <th className="py-4 px-6">Penerima Tamu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bukuTamuList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                      <span className="font-extrabold text-slate-900">{item.tanggal}</span>
                      <br />
                      <span className="text-[11px] text-blue-600 font-mono font-bold">{item.jam}</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-800 text-sm">{item.nama}</p>
                      {item.nomorHp && (
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{item.nomorHp}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-700">
                      {item.instansi}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-sm">
                      {item.keperluan}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {item.penerima}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bukuTamuList.length === 0 && !loadingTamu && (
              <div className="py-16 text-center text-slate-400">
                <ClipboardList size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="font-bold text-sm text-slate-600">Belum ada catatan tamu.</p>
                <p className="text-xs text-slate-400 mt-0.5">Klik tombol &ldquo;+ Catat Tamu Baru&rdquo; untuk menambahkan.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* TAB 2: REPORTING / LAPORAN */}
      {tab === "reporting" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-600/20">
              <BarChart3 size={32} className="mb-4 text-cyan-200" />
              <h3 className="text-3xl font-black mb-1">1,245</h3>
              <p className="text-blue-100 text-sm font-semibold">Total Layanan Warga Terproses</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-500/20">
              <Users size={32} className="mb-4 text-emerald-100" />
              <h3 className="text-3xl font-black mb-1">96.4%</h3>
              <p className="text-emerald-100 text-sm font-semibold">Indeks Kepuasan Masyarakat (IKM)</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-6 text-white shadow-xl shadow-amber-500/20">
              <Clock size={32} className="mb-4 text-amber-100" />
              <h3 className="text-3xl font-black mb-1">± 7 Menit</h3>
              <p className="text-amber-100 text-sm font-semibold">Rata-rata Waktu Terbit per Surat</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center space-y-4">
            <h3 className="font-black text-slate-800 text-lg">Rekapitulasi Pelayanan Terpadu Semester Ini</h3>
            <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
              Unduh ringkasan data permohonan persuratan, mutasi kependudukan fisik, dan statistik loket pelayanan dalam format siap cetak.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <Download size={16} />
                <span>Cetak / Ekspor Rekap Bulanan</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: TTE */}
      {tab === "tte" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Otorisasi TTE Digital</h2>
                <p className="text-slate-500 text-xs">Balai Sertifikasi Elektronik (BSrE BSSN)</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/60 flex justify-between items-center">
              <div>
                <p className="font-black text-emerald-950 text-sm">Status Modul TTE Terverifikasi</p>
                <p className="text-xs text-emerald-700 mt-0.5">Sertifikat aktif untuk Kepala Desa Cimanggu I</p>
              </div>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Aktif
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={14} /> Passphrase Otorisasi
              </label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Otorisasi diperlukan untuk verifikasi dokumen bernomor resmi.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl space-y-4">
            <Key size={28} className="text-cyan-300" />
            <h3 className="text-xl font-black">Riwayat Log Otorisasi TTE</h3>
            <p className="text-xs text-slate-400">Catatan waktu enkripsi dokumen yang sah dan terenkripsi.</p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-200">Pengesahan SKU No. 470/046/Pel-Cmg/XI/2026</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">15 Nov 2026, 09:40 WIB</p>
                </div>
                <span className="text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                  Sukses
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODAL CATAT TAMU BARU */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Catat Tamu Kedinasan Baru</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Registrasi kunjungan resmi Seksi Pelayanan.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateTamu} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Tamu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: H. Asep Syaepudin, S.IP"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Instansi / Lembaga / Asal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kecamatan Cibungbulang / Disdukcapil"
                    value={formData.instansi}
                    onChange={(e) => setFormData({ ...formData, instansi: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">No. WhatsApp / HP</label>
                    <input
                      type="text"
                      placeholder="0812..."
                      value={formData.nomorHp}
                      onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Penerima Tamu</label>
                    <input
                      type="text"
                      value={formData.penerima}
                      onChange={(e) => setFormData({ ...formData, penerima: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Maksud / Keperluan Kunjungan *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tuliskan tujuan kunjungan kedinasan..."
                    value={formData.keperluan}
                    onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-3 flex gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    <span>Simpan Buku Tamu</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
