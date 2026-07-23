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

export function PosyanduJadwalTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduJadwals(selectedPosyandu);
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPosyandu]);

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

      {/* Cards list */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
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

        {loading ? (
          <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400">Belum ada jadwal kegiatan posyandu terdaftar.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((j) => {
              const cfg = statusConfig[j.status] || statusConfig["Terjadwal"];
              return (
                <div key={j.id} className="border border-slate-200/80 rounded-2xl p-5 hover:border-teal-300 hover:shadow-sm transition-all space-y-3 bg-slate-50/30">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-base">{j.namaKegiatan}</h3>
                    <div className="flex items-center gap-2">
                      <select
                        value={j.status}
                        onChange={(e) => handleUpdateStatus(j.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${cfg.color}`}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-all"
                        title="Hapus"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-teal-500 shrink-0" />
                      <span>{new Date(j.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} — Pkl {j.waktu}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-teal-500 shrink-0" />
                      <span>{j.lokasi}</span>
                    </div>
                    {j.petugas && (
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-teal-500 shrink-0" />
                        <span>Petugas: {j.petugas}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <ModalJadwal onClose={() => setShowModal(false)} onSave={handleTambah} />
      )}
    </div>
  );
}

function ModalJadwal({ onClose, onSave }: any) {
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
      status: fd.get("status") || "Terjadwal",
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-slate-800">Tambah Jadwal Posyandu</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Kegiatan *</label>
            <input name="namaKegiatan" required type="text" placeholder="Posyandu Balita Rutin Bulan Ini" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal *</label>
              <input name="tanggal" required type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Waktu / Jam *</label>
              <input name="waktu" required type="text" placeholder="08:00 - 11:30" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Lokasi *</label>
            <input name="lokasi" required type="text" placeholder="Balai Posyandu / Rumah Ketua RW" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Petugas / Kader Penanggung Jawab</label>
            <input name="petugas" type="text" placeholder="Nama Bidan Desa / Kader Posyandu" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status *</label>
            <select name="status" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
              {statusOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-sm">
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
