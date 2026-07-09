"use client";

import { useState, useEffect } from "react";
import { Plus, Search, HeartPulse, Trash2 } from "lucide-react";
import { getPosyanduIbuHamil, addPosyanduIbuHamil, updatePosyanduIbuHamilStatus, deletePosyanduIbuHamil } from "@/actions/posyandu";

export function PosyanduIbuHamilTab({ session }: any) {
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
      const res = await getPosyanduIbuHamil();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleToggleRisiko = async (id: string, currentStatus: boolean) => {
    await updatePosyanduIbuHamilStatus(id, !currentStatus);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data ibu hamil ini?")) {
      await deletePosyanduIbuHamil(id);
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
            <HeartPulse className="w-6 h-6 text-pink-500" />
            Data Ibu Hamil
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data pemantauan ibu hamil (RW: {session?.user?.rw})</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm"
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
            placeholder="Cari nama ibu atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-pink-50 text-pink-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Ibu Hamil</th>
                <th className="px-4 py-3 font-semibold">Berat Badan</th>
                <th className="px-4 py-3 font-semibold">No. HP</th>
                <th className="px-4 py-3 font-semibold">Tgl. Daftar</th>
                <th className="px-4 py-3 font-semibold">Status Risiko</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data ibu hamil ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{b.nik || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{b.namaLengkap}</div>
                      <div className="text-xs text-slate-400">RT {b.rt} / RW {b.rw}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {b.beratBadan ? `${b.beratBadan} kg` : (b.usiaKandungan ? `${b.usiaKandungan} bln kandungan` : "-")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.noHp || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleRisiko(b.id, b.risikoTinggi)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          b.risikoTinggi
                            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        }`}
                      >
                        {b.risikoTinggi ? "Risiko Tinggi" : "Normal"}
                      </button>
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
        <ModalTambahIbuHamil onClose={() => setShowModal(false)} onRefresh={fetchData} session={session} />
      )}
    </div>
  );
}

function ModalTambahIbuHamil({ onClose, onRefresh, session }: any) {
  const [loading, setLoading] = useState(false);
  const rwOptions = session?.user?.rw ? session.user.rw.split(",").map((s: string) => s.trim()) : [];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addPosyanduIbuHamil({
      nik: fd.get("nik")?.toString(),
      namaLengkap: fd.get("namaLengkap"),
      usiaKandungan: parseInt(fd.get("usiaKandungan") as string) || 1,
      beratBadan: fd.get("beratBadan") ? parseFloat(fd.get("beratBadan") as string) : null,
      noHp: fd.get("noHp")?.toString() || null,
      rt: fd.get("rt"),
      rw: fd.get("rw"),
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
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Ibu Hamil</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap ibu hamil</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK *</label>
            <input name="nik" required type="text" maxLength={16} placeholder="16 digit NIK" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap *</label>
            <input name="namaLengkap" required type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Usia Kandungan (Bulan) *</label>
              <input name="usiaKandungan" required type="number" min="1" max="9" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Berat Badan (kg)</label>
              <input name="beratBadan" type="number" step="0.1" placeholder="50.0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nomor HP / WhatsApp</label>
            <input name="noHp" type="text" placeholder="08xxxxxxxxxx" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RT *</label>
              <input name="rt" required type="text" placeholder="001" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RW *</label>
              <select name="rw" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none">
                {rwOptions.length > 0 ? rwOptions.map((rw: string) => (
                  <option key={rw} value={rw}>{rw}</option>
                )) : <option value="">-</option>}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-pink-500 hover:bg-pink-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
