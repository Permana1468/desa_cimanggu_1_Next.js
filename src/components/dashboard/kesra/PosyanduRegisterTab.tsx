"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, BookOpen, Plus, FileText, Download } from "lucide-react";
import { getPosyanduRegisters, addPosyanduRegister, deletePosyanduRegister } from "@/actions/posyandu-baru";

const FORMATS = [
  { id: 1, name: "Format 1", desc: "Register Bayi dan Balita" },
  { id: 2, name: "Format 2", desc: "Register Ibu Hamil & Nifas" },
  { id: 3, name: "Format 3", desc: "Register WUS & PUS" },
  { id: 4, name: "Format 4", desc: "Register Ibu Menyusui" },
  { id: 5, name: "Format 5", desc: "Register Kematian Ibu & Bayi" },
  { id: 6, name: "Format 6", desc: "Data Kegiatan Posyandu" },
  { id: 7, name: "Format 7", desc: "Data Pengunjung & Petugas" }
];

export function PosyanduRegisterTab({ session }: any) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [activeFormat, setActiveFormat] = useState(1);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData(activeFormat);
  }, [activeFormat]);

  const fetchData = async (formatNumber: number) => {
    setLoading(true);
    try {
      const res = await getPosyanduRegisters(formatNumber);
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus catatan register ini?")) {
      setLoading(true);
      await deletePosyanduRegister(id);
      await fetchData(activeFormat);
    }
  };

  const filteredData = data.filter(d => 
    d.posyanduName.toLowerCase().includes(search.toLowerCase()) || 
    (d.dataString && d.dataString.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-500" />
            Buku Register Digital Posyandu
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola pencatatan register Sistem Informasi Posyandu (Format 1 - 7).</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Entri Register Baru
        </button>
      </div>

      {/* Format Selector */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFormat(f.id)}
            className={`whitespace-nowrap px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
              activeFormat === f.id 
                ? "bg-teal-50 text-teal-700 border-teal-200 shadow-sm" 
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.name} <span className="opacity-70 ml-1 font-normal">- {f.desc}</span>
          </button>
        ))}
      </div>

      {/* Table Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari data register..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-slate-600 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 transition-colors">
             <Download className="w-4 h-4" /> Export CSV Format {activeFormat}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-teal-50/50 text-teal-800 text-xs">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Tanggal Catat</th>
                <th className="px-4 py-3 font-semibold">Nama Posyandu</th>
                <th className="px-4 py-3 font-semibold w-1/2">Detail Data (JSON)</th>
                <th className="px-4 py-3 font-semibold text-center rounded-r-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-500" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Tidak ada data register untuk format ini.</td>
                </tr>
              ) : (
                filteredData.map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{new Date(d.recordedDate).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{d.posyanduName}</td>
                    <td className="px-4 py-3">
                      <pre className="text-[10px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 overflow-x-auto max-w-sm whitespace-pre-wrap">
                        {d.dataString}
                      </pre>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-lg text-[10px]">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalTambahRegister 
          formatId={activeFormat} 
          formatName={FORMATS.find(f => f.id === activeFormat)?.name}
          onClose={() => setShowModal(false)} 
          onRefresh={() => fetchData(activeFormat)} 
        />
      )}
    </div>
  );
}

function ModalTambahRegister({ formatId, formatName, onClose, onRefresh }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    
    // Convert all form fields to a JSON string except posyanduName
    const dataObj: any = {};
    fd.forEach((value, key) => {
      if (key !== "posyanduName") dataObj[key] = value;
    });

    await addPosyanduRegister({
      formatNumber: formatId,
      posyanduName: fd.get("posyanduName") as string || "Posyandu Utama",
      dataString: JSON.stringify(dataObj, null, 2)
    });
    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Entri Data Baru</h3>
            <p className="text-xs text-slate-500 mt-0.5">Buku Register {formatName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Posyandu *</label>
            <input name="posyanduName" required className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" placeholder="Cth: Posyandu Melati 1" />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <label className="block text-xs font-semibold text-blue-800 mb-2">
              <FileText className="inline w-3 h-3 mr-1" />
              Konten Register (Mode Fleksibel)
            </label>
            <p className="text-[10px] text-blue-600 mb-3">Sistem ini mendukung pengisian variabel dinamis. Masukkan data apa saja (seperti Nama, BB, TB, dsb) secara bebas dalam bentuk ringkasan teks. Ke depannya kolom ini bisa dipecah per-format.</p>
            <textarea 
              name="catatanData" 
              required 
              rows={5}
              className="w-full px-3 py-2 border border-blue-200 rounded-xl text-xs outline-none focus:border-teal-500 font-mono" 
              placeholder={`Contoh isi untuk format ${formatId}:\nNama Balita: Budi\nBB: 10kg\nTB: 80cm\nVitamin A: Ya`} 
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl">Batal</button>
            <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 rounded-xl flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Simpan Entri
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
