"use client";

import { useState, useEffect } from "react";
import { Plus, Search, HeartPulse, Trash2, Stethoscope } from "lucide-react";
import { getPosyanduRecords, addPosyanduRecord, deletePosyanduRecord, getPosyanduIbuHamil } from "@/actions/posyandu";

const risikoOptions = ["Normal", "Risiko Rendah", "Risiko Sedang", "Risiko Tinggi"];

export function PosyanduLayananIbuHamilTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [ibuHamils, setIbuHamils] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, ibuRes] = await Promise.all([
        getPosyanduRecords("IBU_HAMIL"),
        getPosyanduIbuHamil()
      ]);
      setData(recordsRes);
      setIbuHamils(ibuRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


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
    (d.ibuHamil?.namaLengkap || "").toLowerCase().includes(search.toLowerCase())
  );

  const getRisikoColor = (status: string) => {
    if (status === "Normal") return "bg-green-50 text-green-700 border-green-200";
    if (status === "Risiko Rendah") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (status === "Risiko Sedang") return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-pink-500" />
            Layanan Ibu Hamil
          </h2>
          <p className="text-slate-500 text-sm mt-1">Input data pelayanan pemeriksaan ibu hamil per kunjungan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
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
            placeholder="Cari nama ibu hamil..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-pink-50 text-pink-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Nama Ibu</th>
                <th className="px-4 py-3 font-semibold">Usia Kandungan</th>
                <th className="px-4 py-3 font-semibold">Tekanan Darah</th>
                <th className="px-4 py-3 font-semibold">BB (kg)</th>
                <th className="px-4 py-3 font-semibold">Status Risiko</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center">
                        <HeartPulse className="w-8 h-8 text-pink-300" />
                      </div>
                      <p className="text-slate-400 text-sm">Belum ada data layanan ibu hamil.</p>
                      <button onClick={() => setShowModal(true)} className="text-pink-500 text-sm font-semibold hover:underline">
                        + Input Pelayanan Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(d.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.ibuHamil?.namaLengkap || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{d.ibuHamil?.usiaKandungan ? `${d.ibuHamil.usiaKandungan} Bulan` : "-"}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{d.tensi || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{d.beratBadan ? `${d.beratBadan} kg` : "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRisikoColor(d.statusRisiko || "")}`}>
                        {d.statusRisiko || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{d.keterangan || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(d.id)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalLayananIbuHamil onClose={() => setShowModal(false)} onSave={handleTambah} ibuHamils={ibuHamils} />
      )}
    </div>
  );
}

function ModalLayananIbuHamil({ onClose, onSave, ibuHamils }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await onSave({
      tanggal: new Date(fd.get("tanggal") as string),
      ibuHamilId: fd.get("ibuHamilId") as string,
      tensi: fd.get("tensi") as string,
      beratBadan: fd.get("beratBadan") ? parseFloat(fd.get("beratBadan") as string) : null,
      statusRisiko: fd.get("statusRisiko") as string,
      keterangan: fd.get("keterangan") as string,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Input Layanan Ibu Hamil</h3>
            <p className="text-xs text-slate-500 mt-0.5">Data kunjungan & pemeriksaan ibu hamil</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Kunjungan *</label>
            <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pilih Ibu Hamil *</label>
            <select name="ibuHamilId" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none">
              <option value="">-- Pilih Ibu Hamil --</option>
              {ibuHamils.map((i: any) => (
                <option key={i.id} value={i.id}>{i.namaLengkap} (NIK: {i.nik || "-"})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tekanan Darah (e.g. 120/80)</label>
              <input name="tensi" type="text" placeholder="120/80" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Berat Badan (kg)</label>
              <input name="beratBadan" type="number" step="0.1" min="0" placeholder="60.5" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Risiko *</label>
            <select name="statusRisiko" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none">
              {risikoOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan</label>
            <textarea name="keterangan" rows={2} placeholder="Catatan tambahan..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
