"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Users, Trash2 } from "lucide-react";
import { getPosyanduLansia, addPosyanduLansia, deletePosyanduLansia } from "@/actions/posyandu";

function hitungUsia(tanggalLahir: string | Date): string {
  const tgl = new Date(tanggalLahir);
  const now = new Date();
  return `${now.getFullYear() - tgl.getFullYear()} Tahun`;
}

export function PosyanduLansiaTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduLansia();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data lansia ini?")) {
      await deletePosyanduLansia(id);
      fetchData();
    }
  };

  const filteredData = data.filter(d =>
    d.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    (d.nik && d.nik.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Data Lansia
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data pemantauan kesehatan lansia (RW: {session?.user?.rw})</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Data
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama lansia atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Lansia</th>
                <th className="px-4 py-3 font-semibold">Jenis Kelamin</th>
                <th className="px-4 py-3 font-semibold">Tanggal Lahir</th>
                <th className="px-4 py-3 font-semibold">Usia</th>
                <th className="px-4 py-3 font-semibold">Alamat</th>
                <th className="px-4 py-3 font-semibold">Kondisi Kesehatan</th>
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data lansia ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{b.nik || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{b.namaLengkap}</td>
                    <td className="px-4 py-3">
                      {b.jenisKelamin ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          b.jenisKelamin === "L" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                        }`}>
                          {b.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                        </span>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {b.tanggalLahir
                        ? new Date(b.tanggalLahir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {b.tanggalLahir ? hitungUsia(b.tanggalLahir) : (b.usia ? `${b.usia} Tahun` : "-")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">RT {b.rt} / RW {b.rw}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        b.memilikiPenyakitBawaan
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}>
                        {b.memilikiPenyakitBawaan ? "Punya Penyakit Bawaan" : "Sehat"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(b.id)}
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

        {!loading && filteredData.length > 0 && (
          <div className="mt-4 text-xs text-slate-400 text-right">
            Menampilkan {filteredData.length} dari {data.length} data
          </div>
        )}
      </div>

      {showModal && (
        <ModalTambahLansia onClose={() => setShowModal(false)} onRefresh={fetchData} session={session} />
      )}
    </div>
  );
}

function ModalTambahLansia({ onClose, onRefresh, session }: any) {
  const [loading, setLoading] = useState(false);
  const rwOptions = session?.user?.rw ? session.user.rw.split(",").map((s: string) => s.trim()) : [];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addPosyanduLansia({
      nik: fd.get("nik")?.toString(),
      namaLengkap: fd.get("namaLengkap"),
      usia: parseInt(fd.get("usia") as string) || 60,
      rt: fd.get("rt"),
      rw: fd.get("rw"),
      memilikiPenyakitBawaan: fd.get("memilikiPenyakitBawaan") === "true",
      posyanduName: session?.user?.fullName || "Posyandu"
    });
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Lansia</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap lansia</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK *</label>
            <input name="nik" required type="text" maxLength={16} placeholder="16 digit NIK" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap *</label>
            <input name="namaLengkap" required type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Usia (Tahun) *</label>
            <input name="usia" required type="number" min="45" max="150" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RT *</label>
              <input name="rt" required type="text" placeholder="001" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RW *</label>
              <select name="rw" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                {rwOptions.length > 0 ? rwOptions.map((rw: string) => (
                  <option key={rw} value={rw}>{rw}</option>
                )) : <option value="">-</option>}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kondisi Kesehatan</label>
            <select name="memilikiPenyakitBawaan" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="false">Sehat</option>
              <option value="true">Memiliki Penyakit Bawaan</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
