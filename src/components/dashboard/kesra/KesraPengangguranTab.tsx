"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Briefcase, FileText, Printer, Loader2, Sparkles, GraduationCap } from "lucide-react";
import { getKesraPengangguranList, addKesraPengangguran, deleteKesraPengangguran, getKesraKependudukanList } from "@/actions/kesra";

export function KesraPengangguranTab({ session }: any) {
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
        getKesraPengangguranList(),
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
    if (confirm("Hapus data pengangguran ini?")) {
      await deleteKesraPengangguran(id);
      fetchData();
    }
  };

  const handlePrintList = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Daftar Pengangguran & Tenaga Kerja Desa Cimanggu I</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: bold; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            .table th { background-color: #f5f5f5; }
            .footer { margin-top: 40px; text-align: right; font-size: 12px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            <div class="title">PEMERINTAH KABUPATEN BOGOR</div>
            <div class="title">DESA CIMANGGU I</div>
            <div style="font-size: 11px; color: #666; margin-top: 5px;">REKAPITULASI DATA PENGANGGURAN & TINGKAT KELULUSAN KERJA</div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Usia</th>
                <th>Pendidikan</th>
                <th>Lama Menganggur</th>
                <th>Minat Pelatihan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((d, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${d.nik}</td>
                  <td><b>${d.nama}</b></td>
                  <td>${d.usia} Tahun</td>
                  <td>${d.pendidikan || "-"}</td>
                  <td>${d.lamaMenganggur} Bulan</td>
                  <td>${d.minatPelatihan ? "Ya" : "Tidak"}</td>
                  <td>${d.status}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="footer">
            <div>Dicetak pada: ${new Date().toLocaleDateString("id-ID")}</div>
            <div>Kasi Kesejahteraan Desa Cimanggu I</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
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
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Data Pengangguran & Ketenagakerjaan
          </h2>
          <p className="text-slate-500 text-sm mt-1">Sinkronisasikan pencarian data kependudukan untuk menyalurkan pelatihan tenaga kerja desa.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrintList}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs"
          >
            <Printer className="w-4 h-4" /> Cetak Rekap
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" /> Catat Pengangguran
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Mencari Kerja", val: data.filter(p => p.status === "MENCARI_KERJA").length, desc: "Siap disalurkan kerja", color: "text-red-600 bg-red-50 border-red-100" },
          { label: "Sedang Pelatihan", val: data.filter(p => p.status === "PELATIHAN").length, desc: "Program BLK / Prakerja", color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Minat Mengikuti Pelatihan Kerja", val: data.filter(p => p.minatPelatihan).length, desc: "Fasilitasi UPTD Balai Kerja", color: "text-emerald-600 bg-emerald-50 border-emerald-100" }
        ].map((s, idx) => (
          <div key={idx} className={`p-5 rounded-2xl shadow-sm border ${s.color}`}>
            <span className="block text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
            <span className="block text-3xl font-black mt-2">{s.val} Orang</span>
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
            placeholder="Cari warga menganggur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs">
                <th className="px-3 py-3 font-semibold rounded-l-xl">No</th>
                <th className="px-3 py-3 font-semibold">NIK</th>
                <th className="px-3 py-3 font-semibold">Nama Lengkap</th>
                <th className="px-3 py-3 font-semibold">Usia</th>
                <th className="px-3 py-3 font-semibold">Pendidikan</th>
                <th className="px-3 py-3 font-semibold">Keahlian Utama</th>
                <th className="px-3 py-3 font-semibold">Lama Menganggur</th>
                <th className="px-3 py-3 font-semibold">Minat Pelatihan</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 rounded-r-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-slate-400">Tidak ada data warga pengangguran.</td>
                </tr>
              ) : (
                filteredData.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono">{d.nik}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{d.nama}</td>
                    <td className="px-3 py-3">{d.usia} Tahun</td>
                    <td className="px-3 py-3 flex items-center gap-1 font-bold text-slate-600">
                      <GraduationCap size={14} className="text-slate-400" /> {d.pendidikan || "-"}
                    </td>
                    <td className="px-3 py-3">{d.keahlian || "-"}</td>
                    <td className="px-3 py-3 font-mono">{d.lamaMenganggur} Bulan</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.minatPelatihan ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {d.minatPelatihan ? "Ya" : "Tidak"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === "MENCARI_KERJA" 
                          ? "bg-red-50 text-red-700 border border-red-200" 
                          : d.status === "PELATIHAN" 
                          ? "bg-amber-50 text-amber-700 border border-amber-200" 
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {d.status === "MENCARI_KERJA" ? "Mencari Kerja" : d.status === "PELATIHAN" ? "Pelatihan" : "Sudah Kerja"}
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
        <ModalTambahPengangguran onClose={() => setShowModal(false)} onRefresh={fetchData} kependudukan={kependudukan} />
      )}
    </div>
  );
}

function ModalTambahPengangguran({ onClose, onRefresh, kependudukan }: any) {
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
    await addKesraPengangguran({
      nik: selectedWarga.nik,
      nama: selectedWarga.namaLengkap,
      usia: Math.floor((new Date().getTime() - new Date(selectedWarga.tanggalLahir).getTime()) / (1000 * 60 * 60 * 24 * 365.25)),
      pendidikan: fd.get("pendidikan"),
      keahlian: fd.get("keahlian"),
      lamaMenganggur: parseInt(fd.get("lamaMenganggur") as string) || 0,
      minatPelatihan: fd.get("minatPelatihan") === "true",
      status: fd.get("status")
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
            <h3 className="text-lg font-bold text-slate-800">Catat Pengangguran</h3>
            <p className="text-xs text-slate-500 mt-0.5">Sinkronkan data kependudukan lokal</p>
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
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    <span className="text-[10px] font-bold text-indigo-500">Pilih</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center mb-4">
            <div>
              <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Penduduk Sinkron</span>
              <span className="font-bold text-slate-800 text-xs mt-1 block">{selectedWarga.namaLengkap}</span>
              <span className="text-[10px] text-slate-400 font-mono">{selectedWarga.nik}</span>
            </div>
            <button onClick={() => setSelectedWarga(null)} className="text-[10px] font-bold text-red-500 hover:underline">Ubah</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pendidikan Terakhir</label>
              <input name="pendidikan" required placeholder="SMA / S1" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keahlian Utama</label>
              <input name="keahlian" placeholder="Las / Koding / Marketing" type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Menganggur (Bulan) *</label>
              <input name="lamaMenganggur" required type="number" min="0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Minat Pelatihan</label>
              <select name="minatPelatihan" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium">
                <option value="true">Ya, Minat</option>
                <option value="false">Tidak Minat</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Ketenagakerjaan</label>
            <select name="status" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium">
              <option value="MENCARI_KERJA">Mencari Kerja</option>
              <option value="PELATIHAN">Mengikuti Pelatihan</option>
              <option value="SUDAH_KERJA">Sudah Dapat Kerja</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
