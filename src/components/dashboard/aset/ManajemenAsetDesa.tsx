"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Boxes, 
  Search, 
  Plus, 
  Printer, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  HardHat, 
  Laptop, 
  Layers, 
  MapPin, 
  Trash2, 
  X, 
  Loader2
} from "lucide-react";
import { 
  getAsetDesaList, 
  createAsetDesa, 
  deleteAsetDesa, 
  getAsetSummaryStats, 
  AsetDesaItem, 
  BidangAset, 
  KondisiAset 
} from "@/actions/asetDesa";
import { LabelAsetModal } from "./LabelAsetModal";
import { BukuKibModal } from "./BukuKibModal";

export function ManajemenAsetDesa() {
  const [asetList, setAsetList] = useState<AsetDesaItem[]>([]);
  const [allAsetList, setAllAsetList] = useState<AsetDesaItem[]>([]);
  const [stats, setStats] = useState({
    totalValuasiRp: 0,
    totalItem: 0,
    totalBaik: 0,
    totalKurangBaik: 0,
    totalRusak: 0,
    byBidang: {
      barangKantor: 0,
      gedung: 0,
      infrastruktur: 0,
      tanah: 0,
      lainnya: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [selectedBidang, setSelectedBidang] = useState<string>("ALL");
  const [selectedKondisi, setSelectedKondisi] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showKibModal, setShowKibModal] = useState(false);
  const [selectedLabelItem, setSelectedLabelItem] = useState<AsetDesaItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    namaBarang: "",
    bidang: "BARANG_KANTOR" as BidangAset,
    kategori: "Elektronik & IT",
    merekTipe: "",
    nomorRangkaSeri: "",
    volume: 1,
    satuan: "Unit",
    tahunPengadaan: new Date().getFullYear(),
    sumberDana: "APBDes - Dana Desa (DDS)",
    nilaiPerolehan: 0,
    kondisi: "BAIK" as KondisiAset,
    lokasi: "Kantor Desa Cimanggu I",
    penanggungJawab: "Kaur TU & Umum",
    keterangan: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes, allRes] = await Promise.all([
        getAsetDesaList({
          bidang: selectedBidang,
          kondisi: selectedKondisi,
          search,
        }),
        getAsetSummaryStats(),
        getAsetDesaList(),
      ]);

      if (listRes.success) {
        setAsetList(listRes.data);
      }
      if (allRes.success) {
        setAllAsetList(allRes.data);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedBidang, selectedKondisi, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang) {
      alert("Nama barang/aset wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const res = await createAsetDesa(formData);
      if (res.success && res.item) {
        setShowAddModal(false);
        setFormData({
          namaBarang: "",
          bidang: "BARANG_KANTOR",
          kategori: "Elektronik & IT",
          merekTipe: "",
          nomorRangkaSeri: "",
          volume: 1,
          satuan: "Unit",
          tahunPengadaan: new Date().getFullYear(),
          sumberDana: "APBDes - Dana Desa (DDS)",
          nilaiPerolehan: 0,
          kondisi: "BAIK",
          lokasi: "Kantor Desa Cimanggu I",
          penanggungJawab: "Kaur TU & Umum",
          keterangan: "",
        });
        loadData();
        // Langsung tawarkan cetak label
        setSelectedLabelItem(res.item);
      } else {
        alert(res.error || "Gagal mencatat aset baru.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus data aset "${nama}" dari buku inventaris?`)) return;
    const res = await deleteAsetDesa(id);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || "Gagal menghapus aset.");
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const bidangCategories: { id: string; label: string; icon: any; count: number }[] = [
    { id: "ALL", label: "Semua Aset", icon: Layers, count: stats.totalItem },
    { id: "BARANG_KANTOR", label: "Peralatan & Mesin", icon: Laptop, count: stats.byBidang.barangKantor },
    { id: "GEDUNG_BANGUNAN", label: "Gedung & Bangunan", icon: Building2, count: stats.byBidang.gedung },
    { id: "PEMBANGUNAN_INFRASTRUKTUR", label: "Pembangunan / Fisik", icon: HardHat, count: stats.byBidang.infrastruktur },
    { id: "TANAH_DESA", label: "Tanah Kas Desa", icon: MapPin, count: stats.byBidang.tanah },
  ];

  return (
    <div className="space-y-6">
      {/* 1. HEADER STATISTIK VALUASI & KONDISI ASET DESA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-200">Total Valuasi Aset Desa</span>
            <h3 className="text-xl md:text-2xl font-black text-white mt-1">{formatRupiah(stats.totalValuasiRp)}</h3>
            <span className="text-[10px] text-cyan-100 font-semibold mt-0.5 inline-block">Terdata di Buku Inventaris</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-cyan-200 flex items-center justify-center shrink-0 border border-white/20">
            <Boxes size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Unit Terdaftar</span>
            <h4 className="text-2xl font-black text-slate-900 mt-1">{stats.totalItem} Aset</h4>
            <span className="text-[10px] text-blue-600 font-bold mt-0.5 inline-block">Teregistrasi & Berlabel</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <QrCode size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Kondisi Baik (Prima)</span>
            <h4 className="text-2xl font-black text-emerald-600 mt-1">{stats.totalBaik} Aset</h4>
            <span className="text-[10px] text-emerald-700 font-bold mt-0.5 inline-block">Siap Pakai Operasional</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pemeliharaan & Rusak</span>
            <h4 className="text-2xl font-black text-amber-600 mt-1">{stats.totalKurangBaik + stats.totalRusak} Aset</h4>
            <span className="text-[10px] text-amber-700 font-bold mt-0.5 inline-block">Perlu Tindak Lanjut</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* 2. TAB BIDANG ASET & ACTION TOOLBAR */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Sub-tab Bidang Aset */}
          <div className="flex flex-wrap gap-2">
            {bidangCategories.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBidang(b.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                  selectedBidang === b.id
                    ? "bg-[#1d64ec] text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <b.icon size={15} />
                <span>{b.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedBidang === b.id ? "bg-white/20 text-white" : "bg-white text-slate-600 border"
                }`}>
                  {b.count}
                </span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-sm flex items-center gap-2 transition-all"
            >
              <Plus size={16} />
              <span>Input Aset Baru</span>
            </button>
            <button
              type="button"
              onClick={() => setShowKibModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak Buku KIB</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Cari kode register, nama barang, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold text-slate-500">Kondisi:</span>
            <select
              value={selectedKondisi}
              onChange={(e) => setSelectedKondisi(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 outline-none"
            >
              <option value="ALL">Semua Kondisi</option>
              <option value="BAIK">Baik</option>
              <option value="KURANG_BAIK">Kurang Baik</option>
              <option value="RUSAK_BERAT">Rusak Berat</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. TABEL DAFTAR REGISTRASI ASET DESA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Boxes size={18} className="text-blue-600" />
              <span>Buku Inventaris & Register Aset Desa Cimanggu I</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Standar Permendagri No. 1 Tahun 2016. Dilengkapi kode registrasi unik dan label barcode/QR.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {asetList.length} Aset Terfilter
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="text-xs font-bold">Memuat inventaris aset...</span>
            </div>
          ) : asetList.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs font-bold">
              Belum ada data aset pada filter ini. Klik &quot;Input Aset Baru&quot; untuk menambahkan.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4">No. Reg</th>
                  <th className="py-3.5 px-4">Nama Aset & Spesifikasi</th>
                  <th className="py-3.5 px-4">Bidang</th>
                  <th className="py-3.5 px-4">Tahun / Sumber</th>
                  <th className="py-3.5 px-4">Nilai Perolehan</th>
                  <th className="py-3.5 px-4 text-center">Kondisi</th>
                  <th className="py-3.5 px-4">Lokasi & PIC</th>
                  <th className="py-3.5 px-4 text-right">Aksi & Label</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {asetList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-blue-700 whitespace-nowrap">
                      {item.kodeRegister}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs">
                      <div>{item.namaBarang}</div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Merek: <span className="font-semibold">{item.merekTipe}</span> • Vol: {item.volume} {item.satuan}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                        {item.bidangLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{item.tahunPengadaan}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{item.sumberDana}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(item.nilaiPerolehan)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        item.kondisi === "BAIK"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.kondisi === "KURANG_BAIK"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {item.kondisi}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] max-w-[160px]">
                      <div className="font-bold text-slate-700 truncate">📍 {item.lokasi}</div>
                      <div className="text-slate-400 truncate">PIC: {item.penanggungJawab}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLabelItem(item)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[11px] rounded-xl border border-blue-200 flex items-center gap-1 transition-all shadow-sm"
                        >
                          <QrCode size={13} />
                          <span>Label Barcode</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.namaBarang)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                          title="Hapus aset"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. MODAL INPUT TAMBAH ASET BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Registrasi Inventaris Aset Baru</h3>
                  <p className="text-xs text-slate-500">Nomor register resmi dan label barcode otomatis digenerate.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAset} className="space-y-4 text-xs font-bold">
              {/* Bidang Aset */}
              <div className="space-y-1">
                <label className="text-slate-600 uppercase tracking-wider text-[10px]">Bidang / Kelompok Aset Desa *</label>
                <select
                  value={formData.bidang}
                  onChange={(e) => setFormData({ ...formData, bidang: e.target.value as BidangAset })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-none"
                >
                  <option value="BARANG_KANTOR">Peralatan & Mesin (Barang Kantor & Elektronik)</option>
                  <option value="GEDUNG_BANGUNAN">Gedung & Bangunan (Kantor, Balai, Poskesdes)</option>
                  <option value="PEMBANGUNAN_INFRASTRUKTUR">Pembangunan / Infrastruktur (Jalan, Jembatan, TPT)</option>
                  <option value="TANAH_DESA">Tanah Kas Desa (Bengkok, Lapangan, TPU)</option>
                  <option value="ASET_LAINNYA">Aset Tak Berwujud & Lainnya</option>
                </select>
              </div>

              {/* Nama Barang & Kategori */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600">Nama Barang / Aset *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Genset Honda Silent 5000W"
                    value={formData.namaBarang}
                    onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Kategori / Klasifikasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Mesin & Pembangkit"
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Merek & Nomor Rangka/Seri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600">Merek / Tipe / Dimensi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Honda EU30is Inverter"
                    value={formData.merekTipe}
                    onChange={(e) => setFormData({ ...formData, merekTipe: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Nomor Seri / Rangka / Sertifikat</label>
                  <input
                    type="text"
                    placeholder="Contoh: SN-HND-99210291"
                    value={formData.nomorRangkaSeri}
                    onChange={(e) => setFormData({ ...formData, nomorRangkaSeri: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Volume & Satuan */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600">Jumlah / Volume</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Satuan</label>
                  <input
                    type="text"
                    placeholder="Unit / Meter / M2"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Tahun Pengadaan</label>
                  <input
                    type="number"
                    value={formData.tahunPengadaan}
                    onChange={(e) => setFormData({ ...formData, tahunPengadaan: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Kondisi Fisik</label>
                  <select
                    value={formData.kondisi}
                    onChange={(e) => setFormData({ ...formData, kondisi: e.target.value as KondisiAset })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-none"
                  >
                    <option value="BAIK">Baik</option>
                    <option value="KURANG_BAIK">Kurang Baik</option>
                    <option value="RUSAK_BERAT">Rusak Berat</option>
                  </select>
                </div>
              </div>

              {/* Sumber Dana & Nilai Perolehan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600">Sumber Anggaran / Asal Usul</label>
                  <select
                    value={formData.sumberDana}
                    onChange={(e) => setFormData({ ...formData, sumberDana: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-none"
                  >
                    <option value="APBDes - Dana Desa (DDS)">APBDes - Dana Desa (DDS)</option>
                    <option value="Alokasi Dana Desa (ADD)">Alokasi Dana Desa (ADD)</option>
                    <option value="Bantuan Provinsi (Banprov)">Bantuan Provinsi (Banprov)</option>
                    <option value="Bantuan Keuangan Kab. Bogor (Bankeu)">Bantuan Keuangan Kab. Bogor (Bankeu)</option>
                    <option value="Aset Asli Desa (PADes)">Aset Asli Desa (PADes)</option>
                    <option value="Hibah / Sumbangan Pihak Ketiga">Hibah / Sumbangan Pihak Ketiga</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Nilai Perolehan (Rupiah) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 15000000"
                    value={formData.nilaiPerolehan}
                    onChange={(e) => setFormData({ ...formData, nilaiPerolehan: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Lokasi & PIC */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600">Lokasi Keberadaan Aset *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ruang Rapat Kantor Desa"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kaur TU & Umum"
                    value={formData.penanggungJawab}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan kondisi, riwayat perolehan, atau peruntukan aset..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 shadow"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Simpan & Buat Label</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL CETAK LABEL BARCODE */}
      {selectedLabelItem && (
        <LabelAsetModal
          item={selectedLabelItem}
          onClose={() => setSelectedLabelItem(null)}
        />
      )}

      {/* 6. MODAL CETAK BUKU INVENTARIS KIB RESMI PERMENDAGRI 1/2016 */}
      {showKibModal && (
        <BukuKibModal
          isOpen={showKibModal}
          onClose={() => setShowKibModal(false)}
          items={allAsetList.length > 0 ? allAsetList : asetList}
        />
      )}
    </div>
  );
}
