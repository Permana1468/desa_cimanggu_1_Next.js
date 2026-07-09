"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Award, MapPin, Compass, AlertCircle, RefreshCw, Calendar, Check, X, ShieldAlert } from "lucide-react";
import { getKesraAtsList, addKesraAts, deleteKesraAts, updateKesraAtsStatusBantuan, recordKesraAtsVisit } from "@/actions/kesra";

export function KesraAtsTab({ session }: any) {
  const [ats, setAts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getKesraAtsList();
      setAts(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateKesraAtsStatusBantuan(id, status);
    fetchData();
  };

  const handleRecordVisit = async (id: string) => {
    await recordKesraAtsVisit(id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data anak putus sekolah ini?")) {
      await deleteKesraAts(id);
      fetchData();
    }
  };

  const filteredAts = ats.filter(a =>
    a.nama.toLowerCase().includes(search.toLowerCase()) ||
    (a.nik && a.nik.includes(search))
  );

  // System Reminder: never visited children
  const unvisitedAts = ats.filter(a => !a.terakhirDikunjungi);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-500" />
            Tracking Anak Putus Sekolah (ATS) & Beasiswa
          </h2>
          <p className="text-slate-500 text-sm mt-1">Pantau anak usia sekolah yang tidak menempuh pendidikan formal dan kelola alokasi beasiswa desa.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Data ATS
        </button>
      </div>

      {/* Advokasi Reminder Banner */}
      {unvisitedAts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Reminder Kunjungan Advokasi!</h4>
            <p className="text-xs text-amber-700/80 mt-1">
              Terdapat <strong>{unvisitedAts.length} anak putus sekolah</strong> yang berstatus <em>Belum Pernah Dikunjungi</em>. Segera jadwalkan kunjungan rumah (home visit) untuk advokasi minat belajar / penyaluran beasiswa Kejar Paket.
            </p>
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Anak Putus Sekolah", val: ats.length, desc: "Usia 6 - 21 Tahun", color: "text-amber-600" },
          { label: "Minat Kejar Paket (Ya)", val: ats.filter(a => a.minatKejarPaket).length, desc: "Siap mendaftar PKBM", color: "text-indigo-600" },
          { label: "Beasiswa Disetujui", val: ats.filter(a => a.statusBantuan === "DISETUJUI").length, desc: "Alokasi APBDesa", color: "text-emerald-600" }
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
            <span className={`block text-3xl font-black ${s.color} mt-2`}>{s.val}</span>
            <span className="block text-[10px] text-slate-400 mt-1">{s.desc}</span>
          </div>
        ))}
      </div>

      {/* ATS Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari anak atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-amber-50 text-amber-800 text-xs">
                <th className="px-3 py-3 font-semibold rounded-l-xl">No</th>
                <th className="px-3 py-3 font-semibold">NIK</th>
                <th className="px-3 py-3 font-semibold">Nama Anak</th>
                <th className="px-3 py-3 font-semibold">Usia</th>
                <th className="px-3 py-3 font-semibold">Pendidikan Terakhir</th>
                <th className="px-3 py-3 font-semibold">Alasan Putus Sekolah</th>
                <th className="px-3 py-3 font-semibold">Kejar Paket</th>
                <th className="px-3 py-3 font-semibold">Terakhir Dikunjungi</th>
                <th className="px-3 py-3 font-semibold">Status Beasiswa</th>
                <th className="px-3 py-3 rounded-r-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" /></td>
                </tr>
              ) : filteredAts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-slate-400">Tidak ada data Anak Putus Sekolah.</td>
                </tr>
              ) : (
                filteredAts.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono">{a.nik}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{a.nama}</td>
                    <td className="px-3 py-3">{a.usia} Tahun</td>
                    <td className="px-3 py-3 font-bold text-slate-600">{a.pendidikanTerakhir}</td>
                    <td className="px-3 py-3 max-w-[150px] truncate" title={a.alasanPutusSekolah}>{a.alasanPutusSekolah}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.minatKejarPaket ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {a.minatKejarPaket ? "Minat" : "Tidak"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">{a.terakhirDikunjungi ? new Date(a.terakhirDikunjungi).toLocaleDateString("id-ID") : "Belum Dikunjungi"}</span>
                        <button
                          onClick={() => handleRecordVisit(a.id)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border border-slate-200 text-[9px] flex items-center gap-0.5 transition-all"
                        >
                          <Calendar size={10} /> Catat Kunjungan
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateStatus(a.id, "DISETUJUI")}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            a.statusBantuan === "DISETUJUI" ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                          }`}
                          title="Setujui Beasiswa"
                        >
                          <Check size={10} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(a.id, "DITOLAK")}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            a.statusBantuan === "DITOLAK" ? "bg-red-500 border-red-500 text-white shadow-sm" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                          }`}
                          title="Tolak Beasiswa"
                        >
                          <X size={10} />
                        </button>
                        <span className="text-[10px] font-bold text-slate-500 ml-1">{a.statusBantuan}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
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

      {showModal && (
        <ModalTambahAts onClose={() => setShowModal(false)} onRefresh={fetchData} />
      )}
    </div>
  );
}

function ModalTambahAts({ onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addKesraAts({
      nik: fd.get("nik")?.toString(),
      nama: fd.get("nama"),
      usia: parseInt(fd.get("usia") as string) || 12,
      pendidikanTerakhir: fd.get("pendidikanTerakhir"),
      alasanPutusSekolah: fd.get("alasanPutusSekolah"),
      minatKejarPaket: fd.get("minatKejarPaket") === "true",
      statusBantuan: "PENDING"
    });
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Anak Putus Sekolah</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap anak untuk advokasi beasiswa</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK Anak *</label>
            <input name="nik" required type="text" maxLength={16} placeholder="16 digit NIK" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap Anak *</label>
            <input name="nama" required type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Usia *</label>
              <input name="usia" required type="number" min="5" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pendidikan Terakhir *</label>
              <select name="pendidikanTerakhir" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                <option value="SD">SD/MI</option>
                <option value="SMP">SMP/MTs</option>
                <option value="SMA">SMA/MA/SMK</option>
                <option value="TIDAK_SEKOLAH">Tidak Pernah Sekolah</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alasan Putus Sekolah *</label>
            <input name="alasanPutusSekolah" required placeholder="Faktor Ekonomi / Membantu Orang Tua" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Minat Mengikuti Kejar Paket (Paket A/B/C)?</label>
            <select name="minatKejarPaket" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white">
              <option value="true">Ya, Minat</option>
              <option value="false">Tidak Minat / Bekerja</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
