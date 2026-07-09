"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Database, Trash2, ShieldAlert, FileSpreadsheet, Check, AlertTriangle } from "lucide-react";
import { getKesraDtksList, addKesraDtks, deleteKesraDtks, toggleKesraDtksFlag, importKesraDtks } from "@/actions/kesra";

export function KesraDtksTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getKesraDtksList();
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleToggleFlag = async (id: string, currentFlag: boolean) => {
    await toggleKesraDtksFlag(id, currentFlag);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data DTKS ini?")) {
      await deleteKesraDtks(id);
      fetchData();
    }
  };

  const handleExport = () => {
    // Generate CSV
    const headers = ["NIK", "Nama Kepala Keluarga", "Jumlah Tanggungan", "Penghasilan", "Jenis Bantuan", "Status Kelayakan", "Anomali"];
    const rows = data.map(d => [
      d.nik,
      d.namaKepalaKeluarga,
      d.jumlahTanggungan,
      d.penghasilan,
      d.jenisBantuan,
      d.statusKelayakan,
      d.isFlagged ? "ANOMALI" : "NORMAL"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DTKS_Clean_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvImport = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n").map(l => l.trim()).filter(l => l);
        // Skip header line
        const recordsToImport = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length >= 6) {
            recordsToImport.push({
              nik: cols[0],
              namaKepalaKeluarga: cols[1],
              jumlahTanggungan: parseInt(cols[2]) || 0,
              penghasilan: parseFloat(cols[3]) || 0,
              jenisBantuan: cols[4],
              statusKelayakan: cols[5],
              isFlagged: cols[6] === "ANOMALI"
            });
          }
        }
        const res = await importKesraDtks(recordsToImport);
        alert(`Berhasil mengimpor ${res.imported} data warga DTKS.`);
        fetchData();
      } catch (err) {
        alert("Gagal membaca file CSV. Pastikan format kolom sesuai.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const filteredData = data.filter(d =>
    d.namaKepalaKeluarga.toLowerCase().includes(search.toLowerCase()) ||
    (d.nik && d.nik.includes(search))
  );

  // Auto detect anomalies: NIK receiving > 2 assistance programs
  const anomalies = data.filter(d => {
    const bantuanCount = d.jenisBantuan ? d.jenisBantuan.split(",").map((s: string) => s.trim()).filter((s: string) => s).length : 0;
    return bantuanCount > 2 || d.isFlagged;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-6 h-6 text-rose-500" />
            Cleansing & Sinkronisasi DTKS
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data DTKS lokal, kelayakan penerima bansos, dan flagging data ganda.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs cursor-pointer">
            <FileSpreadsheet className="w-4 h-4" />
            {importing ? "Mengimpor..." : "Import CSV"}
            <input type="file" accept=".csv" onChange={handleCsvImport} disabled={importing} className="hidden" />
          </label>
          <button
            onClick={handleExport}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Data
          </button>
        </div>
      </div>

      {/* Warning Anomali Banner */}
      {anomalies.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Peringatan Anomali Penerima Bansos!</h4>
            <p className="text-xs text-red-700/80 mt-1">
              Terdeteksi <strong>{anomalies.length} kepala keluarga</strong> menerima lebih dari 2 jenis bantuan atau ditandai ganda (flagged). Mohon lakukan cleansing data.
            </p>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kepala keluarga atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-rose-50 text-rose-800 text-xs">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Kepala Keluarga</th>
                <th className="px-4 py-3 font-semibold">Tanggungan</th>
                <th className="px-4 py-3 font-semibold">Penghasilan</th>
                <th className="px-4 py-3 font-semibold">Jenis Bantuan</th>
                <th className="px-4 py-3 font-semibold">Kelayakan</th>
                <th className="px-4 py-3 font-semibold">Anomali/Flag</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data DTKS ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((b, idx) => {
                  const programCount = b.jenisBantuan ? b.jenisBantuan.split(",").length : 0;
                  const hasOverassist = programCount > 2;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{b.nik}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{b.namaKepalaKeluarga}</td>
                      <td className="px-4 py-3 text-slate-600">{b.jumlahTanggungan} Orang</td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">Rp {b.penghasilan.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {b.jenisBantuan.split(",").map((prog: string) => (
                            <span key={prog} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-bold border border-slate-200">
                              {prog.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.statusKelayakan === "LAYAK" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {b.statusKelayakan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFlag(b.id, b.isFlagged)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1 ${
                            b.isFlagged || hasOverassist
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {(b.isFlagged || hasOverassist) ? <AlertTriangle size={12} /> : <Check size={12} />}
                          {(b.isFlagged || hasOverassist) ? "Anomali" : "Normal"}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalTambahDtks onClose={() => setShowModal(false)} onRefresh={fetchData} session={session} />
      )}
    </div>
  );
}

function ModalTambahDtks({ onClose, onRefresh, session }: any) {
  const [loading, setLoading] = useState(false);
  const [selectedBantuan, setSelectedBantuan] = useState<string[]>([]);

  const toggleBantuan = (b: string) => {
    setSelectedBantuan(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    await addKesraDtks({
      nik: fd.get("nik")?.toString(),
      namaKepalaKeluarga: fd.get("namaKepalaKeluarga"),
      jumlahTanggungan: parseInt(fd.get("jumlahTanggungan") as string) || 0,
      penghasilan: parseFloat(fd.get("penghasilan") as string) || 0,
      jenisBantuan: selectedBantuan.join(", "),
      statusKelayakan: fd.get("statusKelayakan"),
      isFlagged: fd.get("isFlagged") === "true"
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
            <h3 className="text-lg font-bold text-slate-800">Tambah Data DTKS</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap warga penerima bansos</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK Kepala Keluarga *</label>
            <input name="nik" required type="text" maxLength={16} placeholder="16 digit NIK" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Kepala Keluarga *</label>
            <input name="namaKepalaKeluarga" required type="text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jumlah Tanggungan *</label>
              <input name="jumlahTanggungan" required type="number" min="0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Penghasilan Bulanan (Rp) *</label>
              <input name="penghasilan" required type="number" min="0" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Bantuan yang Diterima</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {["PKH", "BPNT", "BLT-DD", "KIP", "KIS", "BST"].map(b => (
                <button
                  type="button"
                  key={b}
                  onClick={() => toggleBantuan(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedBantuan.includes(b)
                      ? "bg-rose-500 text-white border-rose-500 shadow-md"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Kelayakan</label>
              <select name="statusKelayakan" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none">
                <option value="LAYAK">LAYAK</option>
                <option value="TIDAK_LAYAK">TIDAK LAYAK</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Flagged (Data Ganda/Anomali)</label>
              <select name="isFlagged" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none">
                <option value="false">Normal</option>
                <option value="true">Tandai Anomali</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-xl disabled:opacity-50 font-semibold">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
