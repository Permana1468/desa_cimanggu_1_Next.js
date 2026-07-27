"use client";

import { useState, useMemo } from "react";
import { Building2, Search, Plus, Printer, FileSpreadsheet, ChevronLeft, ChevronRight, Edit3, Trash2 } from "lucide-react";

export function LpjRegistrasiPembangunanTab({ session }: { session: any }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  // Sample data structure for Daftar Registrasi Pembangunan LPJ
  const [data, setData] = useState<any[]>([
    {
      id: "1",
      noRegistrasi: "REG-PBG/2026/001",
      namaKegiatan: "Pembangunan TTP / Drainage Dusun I Kp. Ciaruteun",
      lokasi: "RT 004 / RW 008, Dusun I",
      volume: "150 Meter",
      sumberDana: "DDS (Dana Desa) TA 2026",
      anggaran: 85000000,
      pelaksana: "TPK Desa Cimanggu I",
      status: "BERJALAN"
    },
    {
      id: "2",
      noRegistrasi: "REG-PBG/2026/002",
      namaKegiatan: "Rehabilitasi Posyandu Mawar 02",
      lokasi: "RT 002 / RW 003, Dusun II",
      volume: "1 Unit (6x8 m)",
      sumberDana: "PBH TA 2026",
      anggaran: 45000000,
      pelaksana: "Kader & TPK Kesra",
      status: "SELESAI"
    }
  ]);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.namaKegiatan.toLowerCase().includes(search.toLowerCase()) ||
      item.noRegistrasi.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalItems = filteredData.length;
  const effectiveLimit = itemsPerPage === "ALL" ? totalItems : itemsPerPage;
  const totalPages = Math.ceil(totalItems / (effectiveLimit || 1));

  const paginatedData = useMemo(() => {
    if (itemsPerPage === "ALL") return filteredData;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 font-bold">
              <Building2 size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">1. Daftar Registrasi Pembangunan</h1>
              <p className="text-xs text-slate-500">Laporan Pertanggungjawaban (LPJ) Kasi Kesejahteraan Desa Cimanggu I</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => alert("Fitur Tambah Registrasi Pembangunan Siap Disesuaikan")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20"
          >
            <Plus size={16} />
            <span>Tambah Registrasi</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Printer size={16} />
            <span>Cetak LPJ</span>
          </button>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari kegiatan / no registrasi / lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-bold text-slate-500">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const val = e.target.value;
                setItemsPerPage(val === "ALL" ? "ALL" : parseInt(val));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value={10}>10 Data</option>
              <option value={25}>25 Data</option>
              <option value={50}>50 Data</option>
              <option value={100}>100 Data</option>
              <option value="ALL">Semua Data</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">No. Registrasi</th>
                <th className="px-6 py-4">Nama Kegiatan Pembangunan</th>
                <th className="px-6 py-4">Lokasi & Volume</th>
                <th className="px-6 py-4">Sumber Dana & Anggaran</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Building2 size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">Belum ada data registrasi pembangunan.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-rose-700">{item.noRegistrasi}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item.namaKegiatan}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="font-semibold text-slate-700">{item.lokasi}</div>
                      <div className="text-slate-400">Vol: {item.volume}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-bold text-emerald-700">Rp {item.anggaran.toLocaleString("id-ID")}</div>
                      <div className="text-slate-500">{item.sumberDana}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="text-slate-500 font-bold">
            {totalItems === 0
              ? "Tidak ada data registrasi pembangunan."
              : itemsPerPage === "ALL"
              ? `Menampilkan seluruh ${totalItems} data registrasi pembangunan.`
              : `Menampilkan ${(currentPage - 1) * (itemsPerPage as number) + 1} - ${Math.min(currentPage * (itemsPerPage as number), totalItems)} dari ${totalItems} data.`}
          </div>

          {itemsPerPage !== "ALL" && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                    currentPage === pg
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
