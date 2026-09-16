"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Layers, 
  Tag, 
  X, 
  Save, 
  RefreshCw,
  Info,
  ListTree,
  Coins,
  ArrowRightLeft,
  PieChart
} from "lucide-react";
import { 
  KodeRekeningItem, 
  KodeKegiatanItem,
  SumberDanaItem,
  KorolariItem,
  RekeningApbdesItem,
  getSavedKodeRekeningList, 
  saveKodeRekeningList, 
  resetKodeRekeningListToDefault,
  getSavedKodeKegiatanList,
  saveKodeKegiatanList,
  resetKodeKegiatanListToDefault,
  getSavedSumberDanaList,
  saveSumberDanaList,
  resetSumberDanaListToDefault,
  getSavedKorolariList,
  saveKorolariList,
  resetKorolariListToDefault,
  getSavedRekeningApbdesList,
  saveRekeningApbdesList,
  resetRekeningApbdesListToDefault
} from "@/lib/kodeRekeningData";

export default function KodeRekeningSettingsTab() {
  const [activeTabMode, setActiveTabMode] = useState<"REKENING" | "KEGIATAN" | "OUTPUT" | "SUMBERDANA" | "KOROLARI">("REKENING");

  // Datasets State
  const [rekeningItems, setRekeningItems] = useState<RekeningApbdesItem[]>([]);
  const [kegiatanItems, setKegiatanItems] = useState<KodeKegiatanItem[]>([]);
  const [outputItems, setOutputItems] = useState<KodeRekeningItem[]>([]);
  const [sumberDanaItems, setSumberDanaItems] = useState<SumberDanaItem[]>([]);
  const [korolariItems, setKorolariItems] = useState<KorolariItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBidang, setSelectedBidang] = useState<string>("ALL");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Modals Open State
  const [isAddRekeningModalOpen, setIsAddRekeningModalOpen] = useState(false);
  const [editingRekeningItem, setEditingRekeningItem] = useState<RekeningApbdesItem | null>(null);

  const [isAddKegiatanModalOpen, setIsAddKegiatanModalOpen] = useState(false);
  const [editingKegiatanItem, setEditingKegiatanItem] = useState<KodeKegiatanItem | null>(null);

  const [isAddOutputModalOpen, setIsAddOutputModalOpen] = useState(false);
  const [editingOutputItem, setEditingOutputItem] = useState<KodeRekeningItem | null>(null);

  const [isAddSumberDanaModalOpen, setIsAddSumberDanaModalOpen] = useState(false);
  const [editingSumberDanaItem, setEditingSumberDanaItem] = useState<SumberDanaItem | null>(null);

  const [isAddKorolariModalOpen, setIsAddKorolariModalOpen] = useState(false);
  const [editingKorolariItem, setEditingKorolariItem] = useState<KorolariItem | null>(null);

  // Form States
  const [formRekeningData, setFormRekeningData] = useState<Omit<RekeningApbdesItem, "id">>({
    kode: "",
    uraian: "",
    kategoriAkun: "5. BELANJA",
    level: 4,
    isCustom: true
  });

  const [formKegiatanData, setFormKegiatanData] = useState<Omit<KodeKegiatanItem, "id">>({
    kodeBidang: "01",
    namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA",
    kodeSubBidang: "01.01",
    namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa",
    kodeKegiatan: "",
    namaKegiatan: "",
    isCustom: true
  });

  const [formOutputData, setFormOutputData] = useState<Omit<KodeRekeningItem, "id">>({
    kodeBidang: "01",
    namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA",
    kodeSubBidang: "01.01",
    namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa",
    kodeKegiatan: "01.01.01",
    namaKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa",
    kodeOutput: "",
    uraianOutput: "",
    satuanOutput: "Paket",
    isCustom: true
  });

  const [formSumberDanaData, setFormSumberDanaData] = useState<Omit<SumberDanaItem, "id">>({
    no: 1,
    kode: "",
    nama: "",
    keterangan: "",
    isCustom: true
  });

  const [formKorolariData, setFormKorolariData] = useState<Omit<KorolariItem, "id">>({
    kodeBelanjaModal: "",
    namaBelanjaModal: "",
    kodeDebet: "1.3.2.11",
    namaDebet: "Peralatan dan Mesin Lainnya",
    kodeKredit: "3.1.1.01",
    namaKredit: "Ekuitas",
    isCustom: true
  });

  useEffect(() => {
    setRekeningItems(getSavedRekeningApbdesList());
    setKegiatanItems(getSavedKodeKegiatanList());
    setOutputItems(getSavedKodeRekeningList());
    setSumberDanaItems(getSavedSumberDanaList());
    setKorolariItems(getSavedKorolariList());
  }, []);

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin mengembalikan SELURUH Master Parameter (Rekening APBDes, Kegiatan, Output, Sumber Dana, dan Korolari) ke standar SiskeuDes Kabupaten Bogor? Data kustom akan terhapus.")) {
      setRekeningItems(resetRekeningApbdesListToDefault());
      setKegiatanItems(resetKodeKegiatanListToDefault());
      setOutputItems(resetKodeRekeningListToDefault());
      setSumberDanaItems(resetSumberDanaListToDefault());
      setKorolariItems(resetKorolariListToDefault());
      setSyncStatus("Seluruh Master Parameter SiskeuDes Kabupaten Bogor berhasil di-reset ke standar resmi.");
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const handleSyncToApbdes = () => {
    setSyncStatus("Sinkronisasi 100% Berhasil! Seluruh Parameter (Struktur Rekening APBDes, Kegiatan, Output, Sumber Dana, & Korolari) terhubung dengan APBDes.");
    setTimeout(() => setSyncStatus(null), 4000);
  };

  // --- Filtering Datasets ---
  const filteredRekeningItems = rekeningItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    return !q || item.kode.toLowerCase().includes(q) || item.uraian.toLowerCase().includes(q) || item.kategoriAkun.toLowerCase().includes(q);
  });

  const filteredKegiatanItems = kegiatanItems.filter(item => {
    const matchesBidang = selectedBidang === "ALL" || item.kodeBidang === selectedBidang;
    const q = searchQuery.toLowerCase().trim();
    return matchesBidang && (!q || item.kodeKegiatan.toLowerCase().includes(q) || item.namaKegiatan.toLowerCase().includes(q) || item.namaSubBidang.toLowerCase().includes(q));
  });

  const filteredOutputItems = outputItems.filter(item => {
    const matchesBidang = selectedBidang === "ALL" || item.kodeBidang === selectedBidang;
    const q = searchQuery.toLowerCase().trim();
    return matchesBidang && (!q || item.kodeOutput.toLowerCase().includes(q) || item.uraianOutput.toLowerCase().includes(q) || item.namaKegiatan.toLowerCase().includes(q));
  });

  const filteredSumberDanaItems = sumberDanaItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    return !q || item.kode.toLowerCase().includes(q) || item.nama.toLowerCase().includes(q) || (item.keterangan || "").toLowerCase().includes(q);
  });

  const filteredKorolariItems = korolariItems.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    return !q || item.kodeBelanjaModal.toLowerCase().includes(q) || item.namaBelanjaModal.toLowerCase().includes(q) || item.namaDebet.toLowerCase().includes(q);
  });

  // Helper when changing Bidang in Form
  const getBidangName = (bCode: string) => {
    switch (bCode) {
      case "01": return "BIDANG PENYELENGGARAN PEMERINTAHAN DESA";
      case "02": return "BIDANG PELAKSANAAN PEMBANGUNAN DESA";
      case "03": return "BIDANG PEMBINAAN KEMASYARAKATAN";
      case "04": return "BIDANG PEMBERDAYAAN MASYARAKAT";
      case "05": return "BIDANG PENANGGULANGAN BENCANA, DARURAT DAN MENDESAK DESA";
      default: return "";
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm animate-in fade-in zoom-in-95 duration-300 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
              <BookOpen className="text-emerald-600" size={24} /> Master Parameter Kode Rekening SiskeuDes
            </h2>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} /> Kab. Bogor 2026
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            Kelola Struktur Rekening APBDes, Kode Kegiatan, Output Parameter, Sumber Dana, dan Korolari Belanja Modal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncToApbdes}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
          >
            <RefreshCw size={14} /> Sinkronkan APBDes
          </button>

          <button
            onClick={() => {
              if (activeTabMode === "REKENING") setIsAddRekeningModalOpen(true);
              else if (activeTabMode === "KEGIATAN") setIsAddKegiatanModalOpen(true);
              else if (activeTabMode === "OUTPUT") setIsAddOutputModalOpen(true);
              else if (activeTabMode === "SUMBERDANA") setIsAddSumberDanaModalOpen(true);
              else if (activeTabMode === "KOROLARI") setIsAddKorolariModalOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus size={14} /> Tambah Parameter
          </button>

          <button
            onClick={handleReset}
            title="Reset ke Standar SiskeuDes Kabupaten Bogor"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <RotateCcw size={14} /> Reset Standard
          </button>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
            <span>{syncStatus}</span>
          </div>
          <button onClick={() => setSyncStatus(null)} className="text-emerald-500 hover:text-emerald-800">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs Switcher */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTabMode("REKENING")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTabMode === "REKENING"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <PieChart size={15} className="text-purple-600" />
          Rekening APBDes ({rekeningItems.length})
        </button>

        <button
          onClick={() => setActiveTabMode("KEGIATAN")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTabMode === "KEGIATAN"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ListTree size={15} className="text-emerald-600" />
          Bidang & Kegiatan ({kegiatanItems.length})
        </button>

        <button
          onClick={() => setActiveTabMode("OUTPUT")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTabMode === "OUTPUT"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Tag size={15} className="text-blue-600" />
          Kode Output ({outputItems.length})
        </button>

        <button
          onClick={() => setActiveTabMode("SUMBERDANA")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTabMode === "SUMBERDANA"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Coins size={15} className="text-amber-600" />
          Sumber Dana ({sumberDanaItems.length})
        </button>

        <button
          onClick={() => setActiveTabMode("KOROLARI")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTabMode === "KOROLARI"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ArrowRightLeft size={15} className="text-indigo-600" />
          Korolari Belanja Modal ({korolariItems.length})
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Struktur Rekening APBDes</span>
            <PieChart size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{rekeningItems.length} Akun</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Kegiatan SiskeuDes</span>
            <ListTree size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{kegiatanItems.length} Kegiatan</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Sumber Dana Resmi</span>
            <Coins size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{sumberDanaItems.length} Sumber</p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500">Pemetaan Korolari</span>
            <ArrowRightLeft size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{korolariItems.length} Aturan</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari parameter kode atau nama uraian..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              <X size={14} />
            </button>
          )}
        </div>

        {(activeTabMode === "KEGIATAN" || activeTabMode === "OUTPUT") && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedBidang("ALL")}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedBidang === "ALL" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              Semua Bidang
            </button>
            {["01", "02", "03", "04", "05"].map((bCode) => (
              <button
                key={bCode}
                onClick={() => setSelectedBidang(bCode)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedBidang === bCode ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                Bidang {bCode}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SUB-TAB 1: REKENING APBDES */}
      {activeTabMode === "REKENING" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-36">Kode Rekening</th>
                <th className="py-3 px-4 min-w-[280px]">Uraian Rekening APBDesa</th>
                <th className="py-3 px-4 w-44">Kategori Akun</th>
                <th className="py-3 px-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRekeningItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-black text-purple-800 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg text-[11px]">
                      {item.kode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${item.level === 1 ? 'text-slate-900 text-sm uppercase' : item.level === 2 ? 'text-slate-800' : 'text-slate-700'}`}>
                      {item.uraian}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                      {item.kategoriAkun}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => { setEditingRekeningItem(item); setFormRekeningData(item); }} className="p-1.5 text-slate-500 hover:text-emerald-600">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => { if (confirm(`Hapus ${item.kode}?`)) setRekeningItems(rekeningItems.filter(i => i.id !== item.id)); }} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 2: BIDANG & KEGIATAN SISKEUDES */}
      {activeTabMode === "KEGIATAN" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-32">Kode Kegiatan</th>
                <th className="py-3 px-4 min-w-[250px]">Nama Uraian Kegiatan APBDes</th>
                <th className="py-3 px-4 min-w-[220px]">Sub Bidang</th>
                <th className="py-3 px-4 min-w-[180px]">Bidang</th>
                <th className="py-3 px-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredKegiatanItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[11px]">
                      {item.kodeKegiatan}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.namaKegiatan}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{item.kodeSubBidang} - {item.namaSubBidang}</td>
                  <td className="py-3 px-4 font-semibold text-slate-600">Bidang {item.kodeBidang}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => { setEditingKegiatanItem(item); setFormKegiatanData(item); }} className="p-1.5 text-slate-500 hover:text-emerald-600">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => { if (confirm(`Hapus ${item.kodeKegiatan}?`)) setKegiatanItems(kegiatanItems.filter(i => i.id !== item.id)); }} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 3: KODE OUTPUT KEGIATAN */}
      {activeTabMode === "OUTPUT" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-28">Kode Output</th>
                <th className="py-3 px-4 min-w-[200px]">Uraian Output</th>
                <th className="py-3 px-4 w-32">Satuan</th>
                <th className="py-3 px-4 min-w-[220px]">Uraian Kegiatan</th>
                <th className="py-3 px-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOutputItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-black text-blue-800 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg text-[11px]">
                      {item.kodeOutput}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.uraianOutput}</td>
                  <td className="py-3 px-4 font-semibold text-slate-600">{item.satuanOutput}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.namaKegiatan}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => { setEditingOutputItem(item); setFormOutputData(item); }} className="p-1.5 text-slate-500 hover:text-blue-600">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => { if (confirm(`Hapus ${item.kodeOutput}?`)) setOutputItems(outputItems.filter(i => i.id !== item.id)); }} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 4: PARAMETER SUMBER DANA */}
      {activeTabMode === "SUMBERDANA" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-16 text-center">No</th>
                <th className="py-3 px-4 w-28">Kode</th>
                <th className="py-3 px-4 min-w-[220px]">Nama Sumber Dana</th>
                <th className="py-3 px-4 min-w-[280px]">Keterangan Deskripsi</th>
                <th className="py-3 px-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSumberDanaItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center font-bold text-slate-500">{item.no}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-[11px]">
                      {item.kode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.nama}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{item.keterangan || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => { setEditingSumberDanaItem(item); setFormSumberDanaData(item); }} className="p-1.5 text-slate-500 hover:text-amber-600">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => { if (confirm(`Hapus Sumber Dana ${item.kode}?`)) setSumberDanaItems(sumberDanaItems.filter(i => i.id !== item.id)); }} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 5: KOROLARI BELANJA MODAL */}
      {activeTabMode === "KOROLARI" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4 w-32">Kode Modal</th>
                <th className="py-3 px-4 min-w-[240px]">Belanja Modal APBDes</th>
                <th className="py-3 px-4 min-w-[200px]">Rekening Debet (Aktiva Tetap)</th>
                <th className="py-3 px-4 min-w-[150px]">Rekening Kredit</th>
                <th className="py-3 px-4 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredKorolariItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-black text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg text-[11px]">
                      {item.kodeBelanjaModal}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.namaBelanjaModal}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-emerald-800">{item.kodeDebet}</p>
                    <p className="text-[11px] text-slate-600 font-semibold">{item.namaDebet}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-purple-800">{item.kodeKredit}</p>
                    <p className="text-[11px] text-slate-600 font-semibold">{item.namaKredit}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => { setEditingKorolariItem(item); setFormKorolariData(item); }} className="p-1.5 text-slate-500 hover:text-indigo-600">
                      <Edit3 size={15} />
                    </button>
                    <button onClick={() => { if (confirm(`Hapus Aturan Korolari ${item.kodeBelanjaModal}?`)) setKorolariItems(korolariItems.filter(i => i.id !== item.id)); }} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL EDIT / TAMBAH SUMBER DANA */}
      {(isAddSumberDanaModalOpen || editingSumberDanaItem) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {editingSumberDanaItem ? `Edit Sumber Dana (${editingSumberDanaItem.kode})` : "Tambah Parameter Sumber Dana"}
              </h3>
              <button onClick={() => { setIsAddSumberDanaModalOpen(false); setEditingSumberDanaItem(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingSumberDanaItem) {
                const updated = sumberDanaItems.map(s => s.id === editingSumberDanaItem.id ? { ...s, ...formSumberDanaData } : s);
                setSumberDanaItems(updated);
                saveSumberDanaList(updated);
                setEditingSumberDanaItem(null);
              } else {
                const newItem: SumberDanaItem = { id: `sd-custom-${Date.now()}`, ...formSumberDanaData };
                const updated = [...sumberDanaItems, newItem];
                setSumberDanaItems(updated);
                saveSumberDanaList(updated);
                setIsAddSumberDanaModalOpen(false);
              }
              setSyncStatus("Sumber Dana berhasil disimpan.");
            }} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Sumber Dana *</label>
                <input type="text" required value={formSumberDanaData.kode} onChange={(e) => setFormSumberDanaData({...formSumberDanaData, kode: e.target.value})} placeholder="Contoh: DDS, ADD, PAD" className="w-full p-2.5 rounded-xl border font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Sumber Dana *</label>
                <input type="text" required value={formSumberDanaData.nama} onChange={(e) => setFormSumberDanaData({...formSumberDanaData, nama: e.target.value})} placeholder="Contoh: Alokasi Dana Desa" className="w-full p-2.5 rounded-xl border font-medium" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan</label>
                <textarea rows={2} value={formSumberDanaData.keterangan || ""} onChange={(e) => setFormSumberDanaData({...formSumberDanaData, keterangan: e.target.value})} placeholder="Deskripsi Sumber Dana" className="w-full p-2.5 rounded-xl border font-medium" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => { setIsAddSumberDanaModalOpen(false); setEditingSumberDanaItem(null); }} className="px-4 py-2 rounded-xl border text-slate-600 font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold flex items-center gap-1.5"><Save size={14} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
