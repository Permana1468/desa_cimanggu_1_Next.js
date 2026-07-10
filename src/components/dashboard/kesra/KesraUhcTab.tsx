"use client";

import { useState, useEffect } from "react";
import { Search, HeartPulse, Printer, CheckCircle, FileText, Loader2 } from "lucide-react";
import { getKesraUsulanUhcList } from "@/actions/kesra";

export function KesraUhcTab({ session }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const list = await getKesraUsulanUhcList();
      setData(list);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePrintTable = () => {
    window.print();
  };

  const filteredData = data.filter(d =>
    d.namaPasien.toLowerCase().includes(search.toLowerCase()) ||
    d.nik.includes(search)
  );

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-emerald-500" />
            Monitoring & Arsip UHC
          </h2>
          <p className="text-slate-500 text-sm mt-1">Lacak hasil pengajuan Usulan UHC warga dan cetak arsip pendaftar.</p>
        </div>
        <button
          onClick={handlePrintTable}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm"
        >
          <Printer className="w-4 h-4" /> Cetak Format Tabel
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        {[
          { label: "Total Usulan Masuk", val: data.length, desc: "Dari seluruh usulan UHC", color: "text-indigo-600 bg-indigo-50" },
          { label: "Dinyatakan Layak", val: data.filter(p => p.hasilVerifikasi === "LAYAK").length, desc: "Usulan memenuhi kriteria Dinas", color: "text-emerald-600 bg-emerald-50" }
        ].map((s, idx) => (
          <div key={idx} className={`p-5 rounded-2xl shadow-sm border border-slate-100 ${s.color}`}>
            <span className="block text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
            <span className="block text-2xl font-black mt-2">{s.val} Warga</span>
            <span className="block text-[10px] opacity-75 mt-1">{s.desc}</span>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print-area">
        <div className="relative mb-5 no-print">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari NIK atau nama pengusul..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>
        
        <div className="mb-6 hidden print:block text-center">
            <h2 className="text-xl font-bold uppercase mb-2">Arsip Pengusul UHC / KIS</h2>
            <p className="text-sm">Pemerintah Desa Cimanggu I, Kecamatan Cibungbulang, Kabupaten Bogor</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-50 text-emerald-800 text-xs">
                <th className="px-3 py-3 font-semibold rounded-l-xl print:rounded-none border-b print:border-black">No</th>
                <th className="px-3 py-3 font-semibold border-b print:border-black">NIK Pasien</th>
                <th className="px-3 py-3 font-semibold border-b print:border-black">Nama Pasien</th>
                <th className="px-3 py-3 font-semibold border-b print:border-black">Alamat</th>
                <th className="px-3 py-3 font-semibold border-b print:border-black">Hasil Verifikasi Desa</th>
                <th className="px-3 py-3 font-semibold rounded-r-xl print:rounded-none border-b print:border-black">Status BPJS Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-black text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-400">Belum ada riwayat usulan UHC.</td>
                </tr>
              ) : (
                filteredData.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 font-medium text-slate-500 print:text-black">{idx + 1}</td>
                    <td className="px-3 py-3 font-mono print:text-black">{d.nik}</td>
                    <td className="px-3 py-3 font-bold text-slate-800 print:text-black">{d.namaPasien}</td>
                    <td className="px-3 py-3 max-w-[200px] truncate print:text-black print:whitespace-normal">{d.alamatPasien}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        d.hasilVerifikasi === 'LAYAK' ? 'bg-emerald-100 text-emerald-700 print:bg-transparent print:border print:text-black' : 
                        'bg-red-100 text-red-700 print:bg-transparent print:border print:text-black'
                      }`}>
                        {d.hasilVerifikasi}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                       {/* Nanti bisa disambung dengan fungsi Update Status */}
                       <span className="text-slate-400 italic print:text-black">Tracking...</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
