"use client";

import { useState, useEffect } from "react";
import { Search, Award, Printer, Edit3 } from "lucide-react";
import { getKesraKependudukanList, updateKesraWargaBansos } from "@/actions/kesra";

export function PuskesosWargaTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRT, setFilterRT] = useState("ALL");
  const [filterRW, setFilterRW] = useState("ALL");
  const [sortBy, setSortBy] = useState("NONE");
  const [selectedWarga, setSelectedWarga] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getKesraKependudukanList();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleEditClick = (warga: any) => {
    setSelectedWarga(warga);
    setShowEditModal(true);
  };

  const filteredData = data.filter(d => {
    const matchSearch = d.namaLengkap.toLowerCase().includes(search.toLowerCase()) || d.nik.includes(search);
    const matchRT = filterRT === "ALL" || d.rt === filterRT;
    const matchRW = filterRW === "ALL" || d.rw === filterRW;
    return matchSearch && matchRT && matchRW;
  });

  if (sortBy === "KK") {
    filteredData.sort((a, b) => {
      const aKK = a.hubunganKeluarga === "KEPALA KELUARGA" ? 0 : 1;
      const bKK = b.hubunganKeluarga === "KEPALA KELUARGA" ? 0 : 1;
      if (aKK !== bKK) return aKK - bKK;
      return (a.noKk || "").localeCompare(b.noKk || "") || a.namaLengkap.localeCompare(b.namaLengkap);
    });
  } else if (sortBy === "NIK") {
    filteredData.sort((a, b) => a.nik.localeCompare(b.nik));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            Data Warga & Bansos (PUSKESOS)
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola dan update penerimaan bansos warga. Akses khusus PUSKESOS (tanpa fitur cetak sertifikat).</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIK atau Nama warga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          
          <select 
            value={filterRW} 
            onChange={e => { setFilterRW(e.target.value); setFilterRT("ALL"); }}
            className="py-2.5 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="ALL">Semua RW</option>
            {Array.from({ length: 9 }, (_, i) => String(i + 1).padStart(3, '0')).map(rw => (
              <option key={rw} value={rw}>RW {rw}</option>
            ))}
          </select>
          
          <select 
            value={filterRT} 
            onChange={e => setFilterRT(e.target.value)}
            className="py-2.5 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="ALL">Semua RT</option>
            {Array.from({ length: 5 }, (_, i) => String(i + 1).padStart(3, '0')).map(rt => (
              <option key={rt} value={rt}>RT {rt}</option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
            className="py-2.5 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
          >
            <option value="NONE">Urutkan: Normal</option>
            <option value="KK">Urutkan: Kepala Keluarga</option>
            <option value="NIK">Urutkan: NIK</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs">
                <th className="px-4 py-3 font-semibold rounded-l-xl">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                <th className="px-4 py-3 font-semibold">Alamat (RT/RW)</th>
                <th className="px-4 py-3 font-semibold">Desil</th>
                <th className="px-4 py-3 font-semibold">Jenis Bantuan</th>
                <th className="px-4 py-3 font-semibold">Status Bansos</th>
                <th className="px-4 py-3 rounded-r-xl font-semibold text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">Tidak ada data kependudukan ditemukan.</td>
                </tr>
              ) : (
                filteredData.map((w, idx) => {
                  const bansos = w.bansosData;
                  let bantuanStr = "-";
                  try {
                    if (bansos?.jenisBantuan) {
                      const parsed = typeof bansos.jenisBantuan === "string" ? JSON.parse(bansos.jenisBantuan) : bansos.jenisBantuan;
                      if (Array.isArray(parsed)) bantuanStr = parsed.join(", ");
                    }
                  } catch (e) { }

                  return (
                    <tr key={w.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono"><HoverMask value={w.nik} /></td>
                      <td className="px-4 py-3 font-bold text-slate-800">{w.namaLengkap}</td>
                      <td className="px-4 py-3">RT {w.rt} / RW {w.rw}</td>
                      <td className="px-4 py-3">
                        {bansos?.desil ? (
                          <span className="font-bold text-xs px-2 py-0.5 rounded-full border text-slate-500 bg-slate-100 border-slate-200">
                            Desil {bansos.desil}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] text-blue-700 font-bold border border-blue-100">
                          {bantuanStr}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {bansos ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${bansos.status === "AKTIF"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                            {bansos.status}
                          </span>
                        ) : (
                          <span className="text-slate-400">Belum Terdata</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => handleEditClick(w)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 font-semibold text-[10px]"
                          >
                            <Edit3 size={11} /> Update
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

      {showEditModal && selectedWarga && (
        <ModalEditBansos
          warga={selectedWarga}
          onClose={() => setShowEditModal(false)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

function ModalEditBansos({ warga, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);
  const bansos = warga.bansosData;

  const [selectedBantuan, setSelectedBantuan] = useState<string[]>([]);

  useEffect(() => {
    if (bansos?.jenisBantuan) {
      try {
        const parsed = typeof bansos.jenisBantuan === "string" ? JSON.parse(bansos.jenisBantuan) : bansos.jenisBantuan;
        if (Array.isArray(parsed)) setSelectedBantuan(parsed);
      } catch (e) { }
    }
  }, [bansos]);

  const toggleBantuan = (b: string) => {
    setSelectedBantuan(prev =>
      prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);

    await updateKesraWargaBansos({
      wargaId: warga.id,
      desil: parseInt(fd.get("desil") as string) || 1,
      jenisBantuan: selectedBantuan,
      status: fd.get("status") as string,
      keterangan: fd.get("keterangan") as string
    });
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Update Status Bansos</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{warga.namaLengkap}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Desil Kelompok (1-10) *</label>
              <input name="desil" required type="number" min="1" max="10" defaultValue={bansos?.desil || 1} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Bansos</label>
              <select name="status" defaultValue={bansos?.status || "AKTIF"} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium">
                <option value="AKTIF">AKTIF</option>
                <option value="NON_AKTIF">NON AKTIF</option>
                <option value="USULAN_RT">USULAN RT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Kategori Program Bantuan</label>
            <div className="grid grid-cols-3 gap-2">
              {["PKH", "BPNT", "BLT-DD", "KIS/PBI", "BST"].map(b => {
                const isSelected = selectedBantuan.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBantuan(b)}
                    className={`px-2 py-1.5 rounded-lg border text-center font-bold text-[10px] transition-all ${isSelected
                      ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keterangan Tambahan</label>
            <input name="keterangan" defaultValue={bansos?.keterangan || ""} placeholder="Kondisi ekonomi / catatan bansos" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>


          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Update Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HoverMask({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);
  if (!value) return <span>-</span>;
  const getMasked = (val: string) => {
    if (val.length <= 6) return "*".repeat(val.length);
    return val.substring(0, 6) + "*".repeat(val.length - 6);
  };
  return (
    <span 
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {visible ? value : getMasked(value)}
    </span>
  );
}
