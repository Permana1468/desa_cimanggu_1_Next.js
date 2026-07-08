"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Users, Trash2 } from "lucide-react";
import { getPosyanduRecords, addPosyanduRecord, deletePosyanduRecord, getPosyanduLansia } from "@/actions/posyandu";

const kondisiOptions = ["Baik", "Cukup", "Kurang Baik", "Perlu Rujukan"];

export function PosyanduLayananLansiaTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [lansias, setLansias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, lansiasRes] = await Promise.all([
        getPosyanduRecords("LANSIA"),
        getPosyanduLansia()
      ]);
      setData(recordsRes);
      setLansias(lansiasRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

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
    (d.lansia?.namaLengkap || "").toLowerCase().includes(search.toLowerCase())
  );

  const getKondisiColor = (kondisi: string) => {
    if (kondisi === "Baik") return "bg-green-50 text-green-700 border-green-200";
    if (kondisi === "Cukup") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (kondisi === "Kurang Baik") return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Layanan Lansia
          </h2>
          <p className="text-slate-500 text-sm mt-1">Input data pelayanan pemeriksaan kesehatan lansia per kunjungan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
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
            placeholder="Cari nama lansia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Nama Lansia</th>
                <th className="px-4 py-3 font-semibold">Tekanan Darah</th>
                <th className="px-4 py-3 font-semibold">BB (kg)</th>
                <th className="px-4 py-3 font-semibold">Gula Darah (mg/dL)</th>
                <th className="px-4 py-3 font-semibold">Kondisi</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-indigo-300" />
                      </div>
                      <p className="text-slate-400 text-sm">Belum ada data layanan lansia.</p>
                      <button onClick={() => setShowModal(true)} className="text-indigo-500 text-sm font-semibold hover:underline">
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
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.lansia?.namaLengkap || "-"}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{d.tensi || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{d.beratBadan ? `${d.beratBadan} kg` : "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{d.gulaDarah ? `${d.gulaDarah} mg/dL` : "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getKondisiColor(d.kondisiUmum || "")}`}>
                        {d.kondisiUmum || "-"}
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
        <ModalLayananLansia onClose={() => setShowModal(false)} onSave={handleTambah} lansias={lansias} />
      )}
    </div>
  );
}

function ModalLayananLansia({ onClose, onSave, lansias }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await onSave({
      tanggal: new Date(fd.get("tanggal") as string),
      lansiaId: fd.get("lansiaId") as string,
      tensi: fd.get("tensi") as string,
      beratBadan: fd.get("beratBadan") ? parseFloat(fd.get("beratBadan") as string) : null,
      gulaDarah: fd.get("gulaDarah") ? parseFloat(fd.get("gulaDarah") as string) : null,
      kondisiUmum: fd.get("kondisiUmum") as string,
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
            <h3 className="text-lg font-bold text-slate-800">Input Layanan Lansia</h3>
            <p className="text-xs text-slate-500 mt-0.5">Data kunjungan & pemeriksaan lansia</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Kunjungan *</label>
            <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pilih Lansia *</label>
            <select name="lansiaId" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">-- Pilih Lansia --</option>
              {lansias.map((l: any) => (
                <option key={l.id} value={l.id}>{l.namaLengkap} (NIK: {l.nik || "-"})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tekanan Darah</label>
              <input name="tensi" type="text" placeholder="120/80" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Berat Badan (kg)</label>
              <input name="beratBadan" type="number" step="0.1" placeholder="60" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gula Darah (mg/dL)</label>
            <input name="gulaDarah" type="number" step="0.1" placeholder="100" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kondisi Umum *</label>
            <select name="kondisiUmum" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              {kondisiOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan</label>
            <textarea name="keterangan" rows={2} placeholder="Catatan tambahan..." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
