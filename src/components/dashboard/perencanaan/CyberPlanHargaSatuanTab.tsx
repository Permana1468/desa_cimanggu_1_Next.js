"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Plus, Printer, Edit2, Trash2, Save, X, Database, Sparkles, Loader2, 
  AlertCircle, Search, RefreshCw, Filter, FileText, CheckCircle2, ChevronRight, Hash
} from "lucide-react";
import { 
  getHargaSatuans, createHargaSatuan, updateHargaSatuan, deleteHargaSatuan, deleteAllHargaSatuans, seedHargaSatuanFromPdf, importHargaSatuanSmart
} from "@/actions/hargaSatuan";
import { CetakHargaSatuan } from "./CetakHargaSatuan";

export function CyberPlanHargaSatuanTab({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("ALL");

  // Form State (Add)
  const [kategori, setKategori] = useState("");
  const [uraian, setUraian] = useState("");
  const [satuan, setSatuan] = useState("");
  const [harga, setHarga] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const tenantId = "f93e947c-1a9b-47a3-913b-2ea2a4290732"; // Desa Cimanggu I

  const fetchData = async () => {
    setLoading(true);
    const res = await getHargaSatuans(tenantId);
    if (res.success) {
      setData(res.data || []);
    } else {
      console.error("Fetch error:", res.error);
      alert("Gagal memuat data: " + res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSmartImport = async () => {
    if (confirm("Ingin mengimpor format Standar Satuan Harga (SSH) 2026 komplit? Item baru akan otomatis ditambahkan (duplikat akan diabaikan secara otomatis).")) {
      setSeedLoading(true);
      const res = await importHargaSatuanSmart(tenantId);
      if (res.success) {
        alert(`Import SSH 2026 Selesai!\n\n• ${res.addedCount} item baru berhasil ditambahkan ke lampiran\n• ${res.skippedCount} item diabaikan (sudah ada / duplikat)`);
        fetchData();
      } else {
        alert("Gagal mengimpor SSH: " + res.error);
      }
      setSeedLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let submitKategori = kategori.trim();
    if (!submitKategori) {
      if (data.length > 0) {
        submitKategori = data[data.length - 1].kategori;
      } else {
        submitKategori = "LAIN-LAIN";
      }
    }

    const res = await createHargaSatuan({
      tenantId,
      kategori: submitKategori.toUpperCase(),
      uraian,
      satuan,
      harga: Number(harga),
      keterangan,
      noUrut: data.length + 1
    });
    
    if (res.success) {
      setShowAddModal(false);
      setKategori("");
      setUraian("");
      setSatuan("");
      setHarga("");
      setKeterangan("");
      fetchData();
    } else {
      setLoading(false);
      console.error("Create error:", res.error);
      alert("Gagal menyimpan data: " + res.error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditLoading(true);

    const res = await updateHargaSatuan(editingItem.id, {
      kategori: editingItem.kategori.toUpperCase(),
      uraian: editingItem.uraian,
      satuan: editingItem.satuan,
      harga: Number(editingItem.harga),
      keterangan: editingItem.keterangan || "",
    });

    if (res.success) {
      setEditingItem(null);
      fetchData();
    } else {
      alert("Gagal memperbarui data: " + res.error);
    }
    setEditLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus item ini?")) {
      await deleteHargaSatuan(id);
      fetchData();
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("PERINGATAN: Yakin ingin menghapus SEMUA data Standar Satuan Harga? Action ini tidak dapat dibatalkan!")) {
      setLoading(true);
      await deleteAllHargaSatuans(tenantId);
      fetchData();
    }
  };

  // Extract all categories sorted
  const categoriesList = Array.from(new Set(data.map(item => item.kategori))).sort();

  // Filtering
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.uraian?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.satuan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keterangan?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedKategori === "ALL" || item.kategori === selectedKategori;
    return matchesSearch && matchesCategory;
  });

  // Grouping Filtered Data
  const groupedData = filteredData.reduce((acc: any, curr: any) => {
    if (!acc[curr.kategori]) {
      acc[curr.kategori] = [];
    }
    acc[curr.kategori].push(curr);
    return acc;
  }, {});

  // Sort items inside each category alphabetically (A-Z)
  Object.keys(groupedData).forEach(kat => {
    groupedData[kat].sort((a: any, b: any) => (a.uraian || "").localeCompare(b.uraian || "", "id", { sensitivity: "base" }));
  });

  if (isPrinting) {
    // For print view, send all data grouped and sorted A-Z
    const allGroupedData = data.reduce((acc: any, curr: any) => {
      if (!acc[curr.kategori]) {
        acc[curr.kategori] = [];
      }
      acc[curr.kategori].push(curr);
      return acc;
    }, {});
    Object.keys(allGroupedData).forEach(kat => {
      allGroupedData[kat].sort((a: any, b: any) => (a.uraian || "").localeCompare(b.uraian || "", "id", { sensitivity: "base" }));
    });
    return <CetakHargaSatuan data={allGroupedData} onBack={() => setIsPrinting(false)} />;
  }

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300 relative space-y-6">
      
      {/* Top Navigation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-start sm:items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all shrink-0"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg">TA 2026</span>
              <span className="text-xs text-slate-400 font-medium">SK No. 400.10.2.4/13/Kpts/X/2025</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
              <Database className="text-emerald-600 shrink-0" /> Standar Satuan Harga (SSH) Belanja Desa
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Daftar penetapan standar harga belanja Desa Cimanggu I Tahun Anggaran 2026.</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button 
            onClick={handleSmartImport}
            disabled={seedLoading}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-2xl flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all"
            title="Otomatis mengimpor format SSH 2026 tanpa menimpa data yang sudah ada"
          >
            {seedLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Import / Muat SSH 2026
          </button>

          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl flex items-center gap-2 text-xs sm:text-sm shadow-md transition-all"
          >
            <Plus size={16} /> Tambah Data
          </button>

          <button 
            onClick={() => setIsPrinting(true)}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-2xl flex items-center gap-2 text-xs sm:text-sm transition-all"
          >
            <Printer size={16} /> Cetak / Export
          </button>

          {data.length > 0 && (
            <button 
              onClick={handleDeleteAll}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl border border-rose-200 transition-all"
              title="Kosongkan Semua Data"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 font-bold">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Items SSH</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">{data.length} <span className="text-xs font-normal text-slate-500">item</span></h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 font-bold">
            <Filter size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Kategori</p>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">{categoriesList.length} <span className="text-xs font-normal text-slate-500">kelompok</span></h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 font-bold">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">SK Penetapan</p>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">11 Okt 2025</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 font-bold">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Status SSH</p>
            <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-black rounded-md">RESMI & AKTIF</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari uraian barang, bambu, besi, ATK, elektronik, atau kategori..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Select Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400 shrink-0 hidden sm:block" />
          <select 
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="w-full md:w-64 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
          >
            <option value="ALL">Semua Kategori ({data.length})</option>
            {categoriesList.map(kat => (
              <option key={kat} value={kat}>
                {kat} ({data.filter(d => d.kategori === kat).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Database SSH Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={36} className="animate-spin text-emerald-600" />
            <p className="text-sm font-bold text-slate-500">Memuat data Standar Satuan Harga...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Database size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-800">Daftar SSH Masih Kosong</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
              Belum ada data Standar Satuan Harga. Anda dapat memuat data resmi komplit sesuai Lampiran SK Kepala Desa Cimanggu I Tahun 2026.
            </p>
            <button 
              onClick={handleSmartImport}
              disabled={seedLoading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
            >
              {seedLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              Import / Muat SSH 2026
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-16 px-4">
            <AlertCircle size={32} className="mx-auto text-amber-500 mb-2 opacity-60" />
            <p className="text-slate-600 font-bold">Item tidak ditemukan untuk kata kunci / filter ini.</p>
            <button onClick={() => { setSearchQuery(""); setSelectedKategori("ALL"); }} className="mt-3 text-xs font-bold text-emerald-600 underline">
              Reset Filter Search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider">
                  <th className="py-4 px-4 text-center w-14">NO</th>
                  <th className="py-4 px-6">URAIAN BARANG / JASA / HONOR</th>
                  <th className="py-4 px-4 text-center w-32">SATUAN</th>
                  <th className="py-4 px-6 text-right w-44">HARGA SATUAN</th>
                  <th className="py-4 px-6 text-left w-48">KETERANGAN</th>
                  <th className="py-4 px-4 text-center w-28">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {Object.keys(groupedData).map((kat, katIdx) => (
                  <React.Fragment key={kat}>
                    {/* Category Header Row */}
                    <tr className="bg-slate-50/90 border-t-2 border-slate-200/60">
                      <td className="py-3 px-4 text-center font-black text-xs text-slate-700 bg-slate-200/50">
                        {katIdx + 1}
                      </td>
                      <td colSpan={5} className="py-3 px-6 font-black text-xs text-slate-800 uppercase tracking-wide bg-slate-100/50">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <ChevronRight size={14} className="text-emerald-600 shrink-0" />
                            {kat}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                            {groupedData[kat].length} Item
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Items Row */}
                    {groupedData[kat].map((item: any, idx: number) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3 px-4 text-center text-xs text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3 px-6 font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                          {item.uraian}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase">
                            {item.satuan || "-"}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                          Rp {item.harga?.toLocaleString('id-ID')},-
                        </td>
                        <td className="py-3 px-6 text-xs text-slate-500">
                          {item.keterangan || "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => setEditingItem(item)} 
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit Item Ini"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Item Ini"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Data */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-black text-xl text-slate-800">Tambah Standar Satuan Harga</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kategori</label>
                <input 
                  type="text" 
                  value={kategori} 
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-semibold uppercase text-slate-800"
                  placeholder="Contoh: 1. PENGHASILAN TETAP / BAHAN DAN ALAT MATERIAL" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Uraian Barang / Jasa / Honor <span className="text-rose-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={uraian} 
                  onChange={(e) => setUraian(e.target.value)} 
                  placeholder="Contoh: Kepala Desa / Semen Portland 50kg" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-medium text-slate-800" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Satuan <span className="text-rose-500">*</span></label>
                  <input 
                    required 
                    type="text" 
                    value={satuan} 
                    onChange={(e) => setSatuan(e.target.value)} 
                    placeholder="Contoh: Bulan / Zak / M3 / Hok" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-medium text-slate-800" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Harga Satuan (Rp) <span className="text-rose-500">*</span></label>
                  <input 
                    required 
                    type="number" 
                    value={harga} 
                    onChange={(e) => setHarga(e.target.value)} 
                    placeholder="Contoh: 4750000" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-black text-slate-800" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Keterangan (Opsional)</label>
                <input 
                  type="text" 
                  value={keterangan} 
                  onChange={(e) => setKeterangan(e.target.value)} 
                  placeholder="Catatan tambahan (misal: 37.500/jam)" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-medium text-slate-800" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Save size={18}/> Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Data */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                <Edit2 className="text-emerald-600" size={20} /> Edit Standar Satuan Harga
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                <X size={20}/>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kategori</label>
                <input 
                  type="text" 
                  value={editingItem.kategori || ""} 
                  onChange={(e) => setEditingItem({...editingItem, kategori: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-semibold uppercase text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Uraian Barang / Jasa / Honor <span className="text-rose-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={editingItem.uraian || ""} 
                  onChange={(e) => setEditingItem({...editingItem, uraian: e.target.value})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-medium text-slate-800" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Satuan <span className="text-rose-500">*</span></label>
                  <input 
                    required 
                    type="text" 
                    value={editingItem.satuan || ""} 
                    onChange={(e) => setEditingItem({...editingItem, satuan: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-medium text-slate-800" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Harga Satuan (Rp) <span className="text-rose-500">*</span></label>
                  <input 
                    required 
                    type="number" 
                    value={editingItem.harga || 0} 
                    onChange={(e) => setEditingItem({...editingItem, harga: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-black text-slate-800" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Keterangan (Opsional)</label>
                <input 
                  type="text" 
                  value={editingItem.keterangan || ""} 
                  onChange={(e) => setEditingItem({...editingItem, keterangan: e.target.value})} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition text-sm font-medium text-slate-800" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  disabled={editLoading}
                  type="submit" 
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {editLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>} Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
