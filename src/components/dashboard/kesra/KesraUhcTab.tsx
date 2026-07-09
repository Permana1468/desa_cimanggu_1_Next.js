"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, HeartPulse, ShieldAlert, Loader2, Sparkles, Check } from "lucide-react";
import { getKesraUhcList, addKesraUhc, deleteKesraUhc, getKesraKependudukanList } from "@/actions/kesra";

export function KesraUhcTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [kependudukan, setKependudukan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [list, kep] = await Promise.all([
        getKesraUhcList(),
        getKesraKependudukanList()
      ]);
      setData(list);
      setKependudukan(kep);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data UHC BPJS warga ini?")) {
      await deleteKesraUhc(id);
      fetchData();
    }
  };

  const filteredData = data.filter(d =>
    d.nama.toLowerCase().includes(search.toLowerCase()) ||
    d.nik.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-emerald-500" />
            Universal Health Coverage (UHC) & KIS
          </h2>
          <p className="text-slate-500 text-sm mt-1">Pantau status keaktifan kepesertaan BPJS PBI (APBD/APBN), non-PBI, dan mandiri tingkat desa.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Daftarkan UHC/KIS
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "BPJS PBI (Bantuan Pemerintah/KIS)", val: data.filter(p => p.jenisPeserta === "PBI").length, desc: "Ditanggung APBD/APBN", color: "text-emerald-600 bg-emerald-50" },
          { label: "BPJS Mandiri / Non-PBI", val: data.filter(p => p.jenisPeserta === "MANDIRI" || p.jenisPeserta === "NON_PBI").length, desc: "Pekerja Penerima Upah / Individu", color: "text-indigo-600 bg-indigo-50" },
          { label: "Status UHC Aktif", val: data.filter(p => p.statusUhc === "AKTIF").length, desc: "Proteksi kesehatan aktif", color: "text-teal-600 bg-teal-50" }
        ].map((s, idx) => (
          <div key={idx} className={`p-5 rounded-2xl shadow-sm border border-slate-100 ${s.color}`}>
            <span className="block text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
            <span className="block text-2xl font-black mt-2">{s.val} Warga</span>
            <span className="block text-[10px] opacity-75 mt-1">{s.desc}</span>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari warga BPJS/KIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-50 text-emerald-800 text-xs">
                <th className="px-3 py-3 font-semibold rounded-l-xl">No</th>
                <th className="px-3 py-3 font-semibold">NIK</th>
                <th className="px-3 py-3 font-semibold">Nama Lengkap</th>
                <th className="px-3 py-3 font-semibold">Nomor Kartu BPJS</th>
                <th className="px-3 py-3 font-semibold">Jenis Kepesertaan</th>
                <th className="px-3 py-3 font-semibold">Keterangan Penyakit/Faskes</th>
                <th className="px-3 py-3 font-semibold">Status UHC</th>
                <th className="px-3 py-3 rounded-r-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-slate-400">Tidak ada data warga terdaftar UHC.</td>
                </tr>
              ) : (
                filteredData.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono">{d.nik}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{d.nama}</td>
                    <td className="px-3 py-3 font-mono font-bold text-slate-600">{d.noBpjs || "Belum Ada"}</td>
                    <td className="px-3 py-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-bold border border-slate-200">
                        {d.jenisPeserta}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{d.keterangan || "-"}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.statusUhc === "AKTIF" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : d.statusUhc === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {d.statusUhc}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleDelete(d.id)}
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
        <ModalTambahUhc onClose={() => setShowModal(false)} onRefresh={fetchData} kependudukan={kependudukan} />
      )}
    </div>
  );
}

function ModalTambahUhc({ onClose, onRefresh, kependudukan }: any) {
  const [loading, setLoading] = useState(false);
  const [searchWarga, setSearchWarga] = useState("");
  const [selectedWarga, setSelectedWarga] = useState<any>(null);

  const filteredWarga = kependudukan.filter((w: any) =>
    w.namaLengkap.toLowerCase().includes(searchWarga.toLowerCase()) ||
    w.nik.includes(searchWarga)
  ).slice(0, 5);

  const handleSelectWarga = (w: any) => {
    setSelectedWarga(w);
    setSearchWarga("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedWarga) {
      alert("Mohon sinkronisasikan warga dari data kependudukan terlebih dahulu.");
      return;
    }
    setLoading(true);
    const fd = new FormData(e.target);
    await addKesraUhc({
      nik: selectedWarga.nik,
      nama: selectedWarga.namaLengkap,
      noBpjs: fd.get("noBpjs")?.toString(),
      jenisPeserta: fd.get("jenisPeserta"),
      statusUhc: fd.get("statusUhc"),
      keterangan: fd.get("keterangan")
    });
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Daftarkan UHC / KIS</h3>
            <p className="text-xs text-slate-500 mt-0.5">Integrasikan kepesertaan jaminan kesehatan warga</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        
        {/* Sync Search Section */}
        {!selectedWarga ? (
          <div className="space-y-2 mb-4">
            <label className="block text-xs font-semibold text-slate-600">Cari & Sinkronkan Data Penduduk *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchWarga}
                onChange={e => setSearchWarga(e.target.value)}
                placeholder="Nama atau NIK warga..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            {searchWarga && (
              <div className="border border-slate-100 bg-white rounded-xl shadow-lg divide-y divide-slate-50 overflow-hidden max-h-40 overflow-y-auto">
                {filteredWarga.map((w: any) => (
                  <div
                    key={w.id}
                    onClick={() => handleSelectWarga(w)}
                    className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs transition-colors flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{w.namaLengkap}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{w.nik}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500">Pilih</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex justify-between items-center mb-4">
            <div>
              <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Penduduk Terpilih</span>
              <span className="font-bold text-slate-800 text-xs mt-1 block">{selectedWarga.namaLengkap}</span>
              <span className="text-[10px] text-slate-400 font-mono">{selectedWarga.nik}</span>
            </div>
            <button onClick={() => setSelectedWarga(null)} className="text-[10px] font-bold text-red-500 hover:underline">Ubah</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">No Kartu BPJS *</label>
              <input name="noBpjs" required placeholder="0001xxxxxxxx" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kepesertaan</label>
              <select name="jenisPeserta" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium">
                <option value="PBI">PBI (Pemerintah/KIS)</option>
                <option value="NON_PBI">NON PBI</option>
                <option value="MANDIRI">MANDIRI</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status UHC</label>
              <select name="statusUhc" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium">
                <option value="AKTIF">AKTIF</option>
                <option value="PENDING">PENDING</option>
                <option value="NON_AKTIF">NON AKTIF</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan / Faskes</label>
              <input name="keterangan" placeholder="Puskesmas Cibungbulang" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Daftarkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
