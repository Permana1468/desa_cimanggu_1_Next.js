"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Activity, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { getPosyanduKehadirans, addPosyanduKehadiran, deletePosyanduKehadiran } from "@/actions/posyandu";

const kategoriConfig: Record<string, { color: string }> = {
  Balita:     { color: "bg-blue-50 text-blue-700 border-blue-200" },
  "Ibu Hamil":{ color: "bg-pink-50 text-pink-700 border-pink-200" },
  Lansia:     { color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export function PosyanduKehadiranTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState<string>("Semua");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduKehadirans();
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
            <Activity className="w-6 h-6 text-teal-500" />
            Rekap Kehadiran
          </h2>
          <p className="text-slate-500 text-sm mt-1">Pencatatan kehadiran peserta posyandu per sesi kegiatan</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 font-black text-lg shrink-0">{filtered.length}</div>
          <div><p className="text-xs text-slate-500 font-medium">Total Peserta</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 font-black text-lg shrink-0">{totalHadir}</div>
          <div><p className="text-xs text-slate-500 font-medium">Hadir</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 font-black text-lg shrink-0">{totalTidak}</div>
          <div><p className="text-xs text-slate-500 font-medium">Tidak Hadir</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peserta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
          </div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Balita">Balita</option>
            <option value="Ibu Hamil">Ibu Hamil</option>
            <option value="Lansia">Lansia</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-teal-50 text-teal-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Kehadiran</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-slate-400 text-sm">
                    Belum ada data kehadiran.
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => {
                  const kat = kategoriConfig[d.kategori] || { color: "bg-slate-50 text-slate-750" };
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{d.nama}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${kat.color}`}>{d.kategori}</span>
                      </td>
                      <td className="px-4 py-3">
                        {d.hadir ? (
                          <span className="flex items-center gap-1.5 text-green-600 font-semibold text-xs">
                            <CheckCircle2 size={15} /> Hadir
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-500 font-semibold text-xs">
                            <XCircle size={15} /> Tidak Hadir
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">{d.keterangan || "-"}</td>
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
        <ModalTambahKehadiran onClose={() => setShowModal(false)} onSave={handleTambah} />
      )}
    </div>
  );
}

function ModalTambahKehadiran({ onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await onSave({
      tanggal: fd.get("tanggal"),
      nama: fd.get("nama"),
      kategori: fd.get("kategori"),
      hadir: fd.get("hadir") === "true",
      keterangan: fd.get("keterangan"),
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Kehadiran</h3>
            <p className="text-xs text-slate-500 mt-0.5">Catat kehadiran peserta</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Kegiatan *</label>
            <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Peserta *</label>
            <input name="nama" required type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori *</label>
              <select name="kategori" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="Balita">Balita</option>
                <option value="Ibu Hamil">Ibu Hamil</option>
                <option value="Lansia">Lansia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kehadiran *</label>
              <select name="hadir" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="true">Hadir</option>
                <option value="false">Tidak Hadir</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan</label>
            <input name="keterangan" type="text" placeholder="Sakit, pergi, dll." className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
