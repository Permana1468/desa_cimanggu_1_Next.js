"use client";

import { useState, useMemo } from "react";
import { Users, Search, Plus, Printer, ChevronLeft, ChevronRight, Edit3, Trash2, Calendar } from "lucide-react";

export function LpjDaftarHadirPekerjaTab({ session }: { session: any }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  const [data, setData] = useState<any[]>([
    {
      id: "1",
      namaPekerja: "Ahmad Subagja",
      jabatan: "Tukang Utama",
      nik: "3201121005880001",
      kegiatan: "Pembangunan TTP Dusun I",
      jumlahHariHadir: 14,
      upahPerHari: 120000,
      totalDiterima: 1680000,
      periode: "Minggu 1 & 2 Juli 2026"
    },
    {
      id: "2",
      namaPekerja: "Ujang Iskandar",
      jabatan: "Pekerja / Laden",
      nik: "3201121508920004",
      kegiatan: "Pembangunan TTP Dusun I",
      jumlahHariHadir: 12,
      upahPerHari: 90000,
      totalDiterima: 1080000,
      periode: "Minggu 1 & 2 Juli 2026"
    }
  ]);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.namaPekerja.toLowerCase().includes(search.toLowerCase()) ||
      item.nik.toLowerCase().includes(search.toLowerCase()) ||
      item.kegiatan.toLowerCase().includes(search.toLowerCase())
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
              <Users size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">3. Daftar Hadir Pekerja</h1>
              <p className="text-xs text-slate-500">Absensi Harian Pekerja Pembangunan Desa Cimanggu I</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => alert("Fitur Tambah Absensi Pekerja Siap Disesuaikan")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20"
          >
            <Plus size={16} />
            <span>Tambah Presensi Pekerja</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Printer size={16} />
            <span>Cetak Daftar Hadir</span>
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
              placeholder="Cari pekerja / NIK / kegiatan..."
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
                <th className="px-6 py-4">Nama Pekerja</th>
                <th className="px-6 py-4">Jabatan & NIK</th>
                <th className="px-6 py-4">Kegiatan Pembangunan</th>
                <th className="px-6 py-4">Kehadiran</th>
                <th className="px-6 py-4">Estimasi Upah</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">Belum ada data hadir pekerja.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{item.namaPekerja}</td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-slate-700">{item.jabatan}</div>
                      <div className="font-mono text-slate-400">{item.nik}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">{item.kegiatan}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {item.jumlahHariHadir} Hari Hadir
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-700">
                      Rp {item.totalDiterima.toLocaleString("id-ID")}
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
              ? "Tidak ada data hadir pekerja."
              : itemsPerPage === "ALL"
              ? `Menampilkan seluruh ${totalItems} data pekerja.`
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
