"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ClipboardList, Trash2, MapPin, Clock, User } from "lucide-react";
import { getPosyanduJadwals, addPosyanduJadwal, updatePosyanduJadwalStatus, deletePosyanduJadwal } from "@/actions/posyandu";

const statusOptions = ["Terjadwal", "Berlangsung", "Selesai", "Dibatalkan"];

const statusConfig: Record<string, { color: string; dot: string }> = {
  Terjadwal:   { color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  Berlangsung: { color: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500 animate-pulse" },
  Selesai:     { color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  Dibatalkan:  { color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-400" },
};

export function PosyanduJadwalTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduJadwals();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleTambah = async (record: any) => {
    await addPosyanduJadwal(record);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus jadwal ini?")) {
      await deletePosyanduJadwal(id);
      fetchData();
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await updatePosyanduJadwalStatus(id, newStatus);
    fetchData();
  };

  const filtered = data.filter(d =>
    d.namaKegiatan.toLowerCase().includes(search.toLowerCase()) ||
    d.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-teal-500" />
            Jadwal Posyandu
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola jadwal kegiatan dan pelayanan posyandu</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Jadwal
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kegiatan atau lokasi..."
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
                <th className="px-4 py-3 font-semibold">Nama Kegiatan</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Waktu</th>
                <th className="px-4 py-3 font-semibold">Lokasi</th>
                <th className="px-4 py-3 font-semibold">Petugas</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                    Tidak ada jadwal ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => {
                  const cfg = statusConfig[d.status] || statusConfig.Terjadwal;
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{d.namaKegiatan}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(d.tanggal).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-slate-600"><Clock size={13} />{d.waktu}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-slate-600"><MapPin size={13} />{d.lokasi}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-slate-600"><User size={13} />{d.petugas || "-"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={d.status}
                          onChange={(e) => handleUpdateStatus(d.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer outline-none ${cfg.color}`}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDelete(d.id)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalTambahJadwal onClose={() => setShowModal(false)} onSave={handleTambah} />
      )}
    </div>
  );
}

function ModalTambahJadwal({ onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await onSave({
      namaKegiatan: fd.get("namaKegiatan"),
      tanggal: fd.get("tanggal"),
      waktu: fd.get("waktu"),
      lokasi: fd.get("lokasi"),
      petugas: fd.get("petugas"),
      status: "Terjadwal",
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Jadwal Kegiatan</h3>
            <p className="text-xs text-slate-500 mt-0.5">Rencanakan kegiatan posyandu</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Kegiatan *</label>
            <input name="namaKegiatan" required type="text" placeholder="Posyandu Balita Rutin" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal *</label>
              <input name="tanggal" required type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Waktu *</label>
              <input name="waktu" required type="time" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lokasi *</label>
            <input name="lokasi" required type="text" placeholder="Balai RW / Posyandu" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Petugas / Kader</label>
            <input name="petugas" type="text" placeholder="Nama kader bertugas" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
