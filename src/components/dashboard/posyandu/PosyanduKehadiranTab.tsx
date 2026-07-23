"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Activity, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { getPosyanduKehadirans, addPosyanduKehadiran, deletePosyanduKehadiran } from "@/actions/posyandu";
import { CitizenSearchAutocomplete } from "./CitizenSearchAutocomplete";

const kategoriConfig: Record<string, { color: string }> = {
  Balita:     { color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Ibu Hamil":{ color: "bg-pink-50 text-pink-700 border-pink-200" },
  Lansia:     { color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export function PosyanduKehadiranTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("Semua");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduKehadirans(selectedPosyandu);
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
    await addPosyanduKehadiran(record);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data kehadiran ini?")) {
      await deletePosyanduKehadiran(id);
      fetchData();
    }
  };

  const filtered = data.filter(d => {
    const matchSearch = d.nama.toLowerCase().includes(search.toLowerCase());
    const matchKat = filterKategori === "Semua" || d.kategori === filterKategori;
    return matchSearch && matchKat;
  });

  const totalHadir = filtered.filter(d => d.hadir).length;
  const totalTidak = filtered.filter(d => !d.hadir).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            Rekap Kehadiran Peserta
          </h2>
          <p className="text-slate-500 text-sm mt-1">Pencatatan kehadiran peserta posyandu per sesi kegiatan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Catat Kehadiran
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">Total Peserta Tercatat</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 size={14} /> Total Hadir</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{totalHadir}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
          <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5"><XCircle size={14} /> Tidak Hadir</p>
          <p className="text-2xl font-black text-red-600 mt-1">{totalTidak}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peserta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            {["Semua", "Balita", "Ibu Hamil", "Lansia"].map(kat => (
              <button
                key={kat}
                onClick={() => setFilterKategori(kat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  filterKategori === kat ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Nama Peserta</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Status Kehadiran</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada catatan kehadiran ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => {
                  const cfg = kategoriConfig[d.kategori] || { color: "bg-slate-50 text-slate-700 border-slate-200" };
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{d.nama}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          {d.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          d.hadir ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {d.hadir ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {d.hadir ? "Hadir" : "Tidak Hadir"}
                        </span>
                      </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalTambahKehadiran
          onClose={() => setShowModal(false)}
          onSave={handleTambah}
          selectedPosyandu={selectedPosyandu}
        />
      )}
    </div>
  );
}

function ModalTambahKehadiran({ onClose, onSave, selectedPosyandu }: any) {
  const [loading, setLoading] = useState(false);
  const [nama, setNama] = useState("");

  const handleCitizenSelect = (citizen: any) => {
    if (citizen.namaLengkap) setNama(citizen.namaLengkap);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await onSave({
      tanggal: fd.get("tanggal"),
      nama,
      kategori: fd.get("kategori"),
      hadir: fd.get("hadir") === "true",
      keterangan: fd.get("keterangan"),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Kehadiran</h3>
            <p className="text-xs text-slate-500 mt-0.5">Catat kehadiran peserta dari Data Kependudukan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl">&times;</button>
        </div>

        {/* Autocomplete Search Citizen */}
        <div className="mb-5 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
          <CitizenSearchAutocomplete
            onSelect={handleCitizenSelect}
            posyanduFilter={selectedPosyandu}
            label="Cari Peserta dari Data Kependudukan"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Kegiatan *</label>
            <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Peserta *</label>
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              type="text"
              placeholder="Nama Peserta Posyandu"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori *</label>
              <select name="kategori" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="Balita">Balita</option>
                <option value="Ibu Hamil">Ibu Hamil</option>
                <option value="Lansia">Lansia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kehadiran *</label>
              <select name="hadir" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="true">Hadir</option>
                <option value="false">Tidak Hadir</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan</label>
            <input name="keterangan" type="text" placeholder="Sakit, izin, dll." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-sm">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
