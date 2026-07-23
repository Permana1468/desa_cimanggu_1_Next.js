"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Baby, Trash2, Stethoscope } from "lucide-react";
import { getPosyanduRecords, addPosyanduRecord, deletePosyanduRecord, getPosyanduBalita } from "@/actions/posyandu";

const statusGiziOptions = ["Normal", "Gizi Kurang", "Stunting", "Gizi Buruk", "Gizi Lebih"];
const imunisasiOptions = ["Tidak Ada", "BCG", "DPT-HB-Hib", "Polio", "Campak/MR", "PCV", "Rotavirus"];

export function PosyanduLayananBalitaTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [balitas, setBalitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, balitasRes] = await Promise.all([
        getPosyanduRecords("BALITA", selectedPosyandu),
        getPosyanduBalita(selectedPosyandu)
      ]);
      setData(recordsRes);
      setBalitas(balitasRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPosyandu]);

  const handleTambah = async (record: any) => {
    await addPosyanduRecord(record);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data layanan ini?")) {
      await deletePosyanduRecord(id);
      fetchData();
    }
  };

  const filtered = data.filter(d =>
    (d.balita?.namaLengkap || "").toLowerCase().includes(search.toLowerCase())
  );

  const getGiziColor = (status: string) => {
    if (status === "Normal") return "bg-green-50 text-green-700 border-green-200";
    if (status === "Gizi Lebih") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-500" />
            Layanan Balita
          </h2>
          <p className="text-slate-500 text-sm mt-1">Input data pelayanan kesehatan balita per kunjungan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Input Pelayanan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama balita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-teal-50 text-teal-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Nama Balita</th>
                <th className="px-4 py-3 font-semibold">BB (kg)</th>
                <th className="px-4 py-3 font-semibold">TB (cm)</th>
                <th className="px-4 py-3 font-semibold">LK (cm)</th>
                <th className="px-4 py-3 font-semibold">Status Gizi</th>
                <th className="px-4 py-3 font-semibold">Imunisasi</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Belum ada catatan pelayanan balita.
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.balita?.namaLengkap || "-"}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{d.beratBadan ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{d.tinggiBadan ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{d.lingkarKepala ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getGiziColor(d.statusGizi || "Normal")}`}>
                        {d.statusGizi || "Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.imunisasi || "-"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{d.keterangan || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
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
        <ModalLayananBalita
          onClose={() => setShowModal(false)}
          onSave={handleTambah}
          balitas={balitas}
        />
      )}
    </div>
  );
}

function ModalLayananBalita({ onClose, onSave, balitas }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await onSave({
      balitaId: fd.get("balitaId"),
      tanggal: new Date(fd.get("tanggal") as string),
      beratBadan: fd.get("beratBadan") ? parseFloat(fd.get("beratBadan") as string) : null,
      tinggiBadan: fd.get("tinggiBadan") ? parseFloat(fd.get("tinggiBadan") as string) : null,
      lingkarKepala: fd.get("lingkarKepala") ? parseFloat(fd.get("lingkarKepala") as string) : null,
      statusGizi: fd.get("statusGizi"),
      imunisasi: fd.get("imunisasi"),
      keterangan: fd.get("keterangan"),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-800">Catat Pelayanan Balita</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pilih Balita *</label>
            <select name="balitaId" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
              <option value="">-- Pilih Balita --</option>
              {balitas.map((b: any) => (
                <option key={b.id} value={b.id}>{b.namaLengkap} ({b.nik ? `NIK: ${b.nik}` : `RT ${b.rt}/RW ${b.rw}`})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Kunjungan *</label>
            <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">BB (kg) *</label>
              <input name="beratBadan" required type="number" step="0.1" placeholder="10.5" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">TB (cm) *</label>
              <input name="tinggiBadan" required type="number" step="0.1" placeholder="75.0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">LK (cm)</label>
              <input name="lingkarKepala" type="number" step="0.1" placeholder="45.0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Gizi *</label>
            <select name="statusGizi" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
              {statusGiziOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Imunisasi Diberikan</label>
            <select name="imunisasi" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
              {imunisasiOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catatan / Keterangan</label>
            <textarea name="keterangan" rows={2} placeholder="Catatan tambahan..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-sm">
              {loading ? "Menyimpan..." : "Simpan Layanan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
