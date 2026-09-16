"use client";

import React, { useState, useEffect } from "react";
import { SafePrintPortal } from "./SafePrintPortal";
import { 
  Printer, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Sparkles, 
  Award,
  Search,
  Table,
  FileText,
  Pencil,
  X,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { getRkkdPagus, updateRkkdPagu } from "@/lib/rkkdStore";

export interface RkkdBanprovItem {
  id: string;
  no: number;
  categoryGroup: "INFRASTRUKTUR" | "NON-INFRASTRUKTUR";
  prasarana: string;
  vol: string;
  lokasi: string;
  anggaran: number;
  sumberDana: "BANPROV";
  ket?: string;
}

const defaultBanprovList: RkkdBanprovItem[] = [
  // INFRASTRUKTUR
  { id: "bp-1", no: 1, categoryGroup: "INFRASTRUKTUR", prasarana: "REHABILITASI GEDUNG & RUANG PELAYANAN PUBLIK DESA", vol: "1 PAKET", lokasi: "Desa Cimanggu I", anggaran: 60000000, sumberDana: "BANPROV" },
  { id: "bp-2", no: 2, categoryGroup: "INFRASTRUKTUR", prasarana: "PEMBANGUNAN SARANA PRASARANA POSYANDU & KESEHATAN DESA", vol: "1 UNIT", lokasi: "RT 02/RW 04", anggaran: 35000000, sumberDana: "BANPROV" },

  // NON-INFRASTRUKTUR
  { id: "bp-3", no: 1, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "BIAYA OPERASIONAL POSYANDU SE-DESA (BANTUAN PROVINSI JABAR)", vol: "7 POSYANDU x 12 BLN", lokasi: "Desa Cimanggu I", anggaran: 17500000, sumberDana: "BANPROV" },
  { id: "bp-4", no: 2, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "OPERASIONAL TP-PKK DESA BANTUAN PROVINSI", vol: "1 THN", lokasi: "Desa Cimanggu I", anggaran: 7500000, sumberDana: "BANPROV" },
  { id: "bp-5", no: 3, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "DUKUNGAN DESA DIGITAL & APARATUR DESA PROVINSI", vol: "1 PAKET", lokasi: "Desa Cimanggu I", anggaran: 10000000, sumberDana: "BANPROV" }
];

export function RkkdBanprovSection() {
  const [items, setItems] = useState<RkkdBanprovItem[]>(defaultBanprovList);
  const [paguBanprov, setPaguBanprov] = useState<number>(130000000);
  const [isEditingPagu, setIsEditingPagu] = useState(false);
  const [paguInputVal, setPaguInputVal] = useState<number>(130000000);

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "print-preview">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "INFRASTRUKTUR" | "NON-INFRASTRUKTUR">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RkkdBanprovItem | null>(null);
  const [newCategoryGroup, setNewCategoryGroup] = useState<"INFRASTRUKTUR" | "NON-INFRASTRUKTUR">("INFRASTRUKTUR");
  const [newPrasarana, setNewPrasarana] = useState("");
  const [newVol, setNewVol] = useState("");
  const [newLokasi, setNewLokasi] = useState("Cimanggu I");
  const [newAnggaran, setNewAnggaran] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    const initial = getRkkdPagus().PBP;
    setPaguBanprov(initial);
    setPaguInputVal(initial);

    const handleSync = () => {
      const current = getRkkdPagus().PBP;
      setPaguBanprov(current);
    };
    window.addEventListener("rkkd_pagu_updated", handleSync);
    return () => window.removeEventListener("rkkd_pagu_updated", handleSync);
  }, []);

  useEffect(() => {
    if (mounted) {
      updateRkkdPagu("PBP", paguBanprov);
    }
  }, [paguBanprov, items, mounted]);

  const handleSavePagu = () => {
    if (paguInputVal > 0) {
      setPaguBanprov(paguInputVal);
      updateRkkdPagu("PBP", paguInputVal);
    }
    setIsEditingPagu(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNewCategoryGroup("INFRASTRUKTUR");
    setNewPrasarana("");
    setNewVol("");
    setNewLokasi("Desa Cimanggu I");
    setNewAnggaran(0);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RkkdBanprovItem) => {
    setEditingItem(item);
    setNewCategoryGroup(item.categoryGroup);
    setNewPrasarana(item.prasarana);
    setNewVol(item.vol);
    setNewLokasi(item.lokasi);
    setNewAnggaran(item.anggaran);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus item RKKD BANPROV ini?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrasarana || !newAnggaran) return;

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? {
        ...i,
        categoryGroup: newCategoryGroup,
        prasarana: newPrasarana.toUpperCase(),
        vol: newVol || "1 PAKET",
        lokasi: newLokasi,
        anggaran: Number(newAnggaran) || 0
      } : i));
    } else {
      const newItem: RkkdBanprovItem = {
        id: `bp-${Date.now()}`,
        no: items.length + 1,
        categoryGroup: newCategoryGroup,
        prasarana: newPrasarana.toUpperCase(),
        vol: newVol || "1 PAKET",
        lokasi: newLokasi,
        anggaran: Number(newAnggaran) || 0,
        sumberDana: "BANPROV"
      };
      setItems(prev => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  // Calculations
  const totalInfra = items.filter(i => i.categoryGroup === "INFRASTRUKTUR").reduce((a, b) => a + b.anggaran, 0);
  const totalNonInfra = items.filter(i => i.categoryGroup === "NON-INFRASTRUKTUR").reduce((a, b) => a + b.anggaran, 0);
  const totalPenggunaan = totalInfra + totalNonInfra;
  const sisaPagu = paguBanprov - totalPenggunaan;

  const filteredItems = items.filter(i => {
    if (selectedCategory !== "ALL" && i.categoryGroup !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNama = i.prasarana.toLowerCase().includes(q);
      const matchLokasi = i.lokasi.toLowerCase().includes(q);
      if (!matchNama && !matchLokasi) return false;
    }
    return true;
  });

  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

  const renderOfficialDocument = () => (
    <div className="space-y-4">
      {/* KOP LAPORAN BANPROV */}
      <div className="text-center space-y-1 border-b-2 border-black pb-4">
        <h3 className="font-extrabold text-sm uppercase tracking-wide">
          PEMERINTAH KABUPATEN BOGOR - KECAMATAN CIBUNGBULANG
        </h3>
        <h2 className="font-black text-base uppercase tracking-wider text-black">
          PEMERINTAH DESA CIMANGGU I
        </h2>
        <p className="text-[10pt] font-serif italic">
          Jl. Raya Cimanggu I No. 01 Kode Pos 16630
        </p>
        <div className="pt-2 text-[10pt] font-bold uppercase tracking-wider underline">
          MATRIKS RENCANA KERJA KEGIATAN DESA BANTUAN KEUANGAN PROVINSI (RKKD BANPROV) TAHUN ANGGARAN 2026
        </div>
      </div>

      {/* SUMMARY INFO BANPROV */}
      <div className="flex justify-between items-center text-[9pt] font-serif font-bold py-1">
        <div>SUMBER ANGGARAN: BANTUAN KEUANGAN PROVINSI JAWA BARAT (BANPROV)</div>
        <div>PAGU ANGGARAN: Rp {formatRupiah(paguBanprov)}</div>
      </div>

      {/* TABLE DATA BANPROV */}
      <table className="w-full border-collapse border border-black text-[8pt] font-serif">
        <thead>
          <tr className="bg-slate-200 text-center font-bold border-b border-black">
            <th className="border border-black p-1.5 w-10">NO</th>
            <th className="border border-black p-1.5 w-36">KATEGORI</th>
            <th className="border border-black p-1.5">PRASARANA / URAIAN KEGIATAN</th>
            <th className="border border-black p-1.5 w-28">VOLUME</th>
            <th className="border border-black p-1.5 w-28">LOKASI</th>
            <th className="border border-black p-1.5 w-36 text-right">ANGGARAN (RP)</th>
          </tr>
        </thead>
        <tbody>
          {/* GROUP INFRASTRUKTUR */}
          <tr className="bg-indigo-100 font-bold border-b border-black">
            <td className="border border-black p-1 text-center font-black">A</td>
            <td className="border border-black p-1 font-bold" colSpan={4}>BIDANG INFRASTRUKTUR DESA</td>
            <td className="border border-black p-1 text-right font-black">Rp {formatRupiah(totalInfra)}</td>
          </tr>
          {items.filter(i => i.categoryGroup === "INFRASTRUKTUR").map((item, idx) => (
            <tr key={item.id} className="border-b border-slate-300">
              <td className="border border-black p-1 text-center">{idx + 1}</td>
              <td className="border border-black p-1 text-center font-semibold text-[7.5pt]">INFRASTRUKTUR</td>
              <td className="border border-black p-1 font-bold uppercase">{item.prasarana}</td>
              <td className="border border-black p-1 text-center font-mono">{item.vol}</td>
              <td className="border border-black p-1 text-center">{item.lokasi}</td>
              <td className="border border-black p-1 text-right font-mono font-bold">Rp {formatRupiah(item.anggaran)}</td>
            </tr>
          ))}

          {/* GROUP NON-INFRASTRUKTUR */}
          <tr className="bg-indigo-100 font-bold border-b border-black">
            <td className="border border-black p-1 text-center font-black">B</td>
            <td className="border border-black p-1 font-bold" colSpan={4}>BIDANG NON-INFRASTRUKTUR / PEMBERDAYAAN</td>
            <td className="border border-black p-1 text-right font-black">Rp {formatRupiah(totalNonInfra)}</td>
          </tr>
          {items.filter(i => i.categoryGroup === "NON-INFRASTRUKTUR").map((item, idx) => (
            <tr key={item.id} className="border-b border-slate-300">
              <td className="border border-black p-1 text-center">{idx + 1}</td>
              <td className="border border-black p-1 text-center font-semibold text-[7.5pt]">NON-INFRASTRUKTUR</td>
              <td className="border border-black p-1 font-bold uppercase">{item.prasarana}</td>
              <td className="border border-black p-1 text-center font-mono">{item.vol}</td>
              <td className="border border-black p-1 text-center">{item.lokasi}</td>
              <td className="border border-black p-1 text-right font-mono font-bold">Rp {formatRupiah(item.anggaran)}</td>
            </tr>
          ))}

          {/* TOTAL BANPROV */}
          <tr className="bg-slate-300 font-black border-t-2 border-black text-black">
            <td className="border border-black p-1.5 text-center" colSpan={5}>TOTAL RENCANA PENGGUNAAN BANPROV</td>
            <td className="border border-black p-1.5 text-right font-mono text-[9pt]">Rp {formatRupiah(totalPenggunaan)}</td>
          </tr>
          <tr className="bg-indigo-50 font-bold border-b-2 border-black text-indigo-900">
            <td className="border border-black p-1.5 text-center" colSpan={5}>SISA / BALANCE PAGU BANPROV</td>
            <td className="border border-black p-1.5 text-right font-mono text-[9pt]">Rp {formatRupiah(sisaPagu)}</td>
          </tr>
        </tbody>
      </table>

      {/* SIGNATURE BLOCK */}
      <div className="mt-8 flex justify-end text-center font-bold text-[9pt] font-serif">
        <div className="w-64 space-y-1">
          <div>Bogor, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
          <div>KEPALA DESA CIMANGGU I</div>
          <div className="h-16"></div>
          <div className="underline uppercase font-extrabold">HERNAWAN M. SODIK</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP SUMMARY METRIC CARDS                                   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {/* Card 1: Pagu BANPROV */}
        <div className="bg-gradient-to-br from-indigo-700 to-blue-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">PAGU RKKD BANPROV 2026</span>
            <Award size={20} className="text-indigo-300" />
          </div>
          {isEditingPagu ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={paguInputVal}
                onChange={(e) => setPaguInputVal(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-white text-slate-900 font-extrabold text-sm focus:outline-none"
              />
              <button
                onClick={handleSavePagu}
                className="px-3 py-1.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all cursor-pointer"
              >
                Simpan
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black text-white font-mono">Rp {formatRupiah(paguBanprov)}</p>
              <button
                onClick={() => { setPaguInputVal(paguBanprov); setIsEditingPagu(true); }}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Pencil size={12} /> Input Pagu
              </button>
            </div>
          )}
          <p className="text-[10px] text-indigo-200 font-semibold mt-1">Bantuan Keuangan Provinsi Jabar (Dapat Diubah)</p>
        </div>

        {/* Card 2: Total Penggunaan BANPROV */}
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Penggunaan BANPROV</span>
            <FileText size={20} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">Rp {formatRupiah(totalPenggunaan)}</p>
          <p className="text-[10px] text-indigo-400 font-semibold mt-1">Infra: Rp {formatRupiah(totalInfra)} | Non-Infra: Rp {formatRupiah(totalNonInfra)}</p>
        </div>

        {/* Card 3: Balance / Sisa Pagu */}
        <div className={`p-6 rounded-3xl text-white shadow-xl relative overflow-hidden ${sisaPagu === 0 ? "bg-indigo-950 border border-indigo-500/30" : sisaPagu > 0 ? "bg-amber-600" : "bg-rose-700"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">SISA / BALANCE PAGU BANPROV</span>
            {sisaPagu === 0 ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertTriangle size={20} className="text-amber-200" />}
          </div>
          <p className="text-2xl font-black text-white font-mono">Rp {formatRupiah(sisaPagu)}</p>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${sisaPagu === 0 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-white/20 text-white"}`}>
            {sisaPagu === 0 ? "✓ Klop Balance 100%!" : sisaPagu > 0 ? `Masih Ada Sisa Pagu Rp ${formatRupiah(sisaPagu)}` : `Over Budget Rp ${formatRupiah(Math.abs(sisaPagu))}`}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. NOTICE ALERT BANNER                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-3xl flex items-center justify-between no-print shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Award size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">
              {sisaPagu === 0 ? "✓ ANGGARAN RKKD BANPROV BALANCE 100%!" : "⚠️ STATUS ALOKASI BANPROV PERLU PENYESUAIAN"}
            </h4>
            <p className="text-indigo-800 text-xs font-medium">
              Seluruh alokasi kegiatan RKKD BANPROV (Rp {formatRupiah(paguBanprov)}) tersinkron langsung dengan APBDes Kode Rekening 4.2.4.01. Bantuan Keuangan Provinsi.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. TOOLBAR WITH VIEW MODE SWITCHER & BUTTONS                   */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm no-print">
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === "table"
                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Table size={15} /> Tabel Data Interaktif
          </button>
          <button
            onClick={() => setViewMode("print-preview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === "print-preview"
                ? "bg-indigo-600 text-white shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText size={15} /> Preview Format Cetak (F4)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Tambah Item BANPROV
          </button>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer size={16} /> Cetak Dokumen BANPROV (F4)
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. CONTENT VIEW (TABLE vs PRINT PREVIEW)                      */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden no-print">
          {/* Search & Category Filter */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari prasarana / uraian BANPROV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              {[
                { id: "ALL", label: `Semua Bidang (${items.length} Item)` },
                { id: "INFRASTRUKTUR", label: "Infrastruktur" },
                { id: "NON-INFRASTRUKTUR", label: "Non-Infrastruktur" }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">NO</th>
                  <th className="py-3 px-4 w-44">KATEGORI BIDANG</th>
                  <th className="py-3 px-4">PRASARANA / URAIAN KEGIATAN</th>
                  <th className="py-3 px-4 w-36 text-center">VOLUME</th>
                  <th className="py-3 px-4 w-32 text-center">LOKASI</th>
                  <th className="py-3 px-4 text-right w-44">NILAI ANGGARAN (RP)</th>
                  <th className="py-3 px-4 text-center w-24">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-500">{index + 1}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${item.categoryGroup === "INFRASTRUKTUR" ? "bg-indigo-100 text-indigo-900 border border-indigo-200" : "bg-purple-100 text-purple-900 border border-purple-200"}`}>
                        {item.categoryGroup}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900 uppercase">{item.prasarana}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-600">{item.vol}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{item.lokasi}</td>
                    <td className="py-3 px-4 text-right font-black font-mono text-indigo-700">Rp {formatRupiah(item.anggaran)}</td>
                    <td className="py-3 px-4 text-center space-x-1">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* PRINT PREVIEW CONTAINER */
        <div className="bg-slate-200 p-4 md:p-8 rounded-[2.5rem] border border-slate-300 flex justify-center no-print overflow-x-auto">
          <div className="bg-white text-black p-[10mm] rounded-sm shadow-2xl border border-slate-300 w-[215.9mm] min-h-[330mm] font-serif text-[8pt] leading-snug shrink-0 box-border my-2">
            {renderOfficialDocument()}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. ISOLATED PRINT PORTAL FOR DIRECT PRINT (F4 PORTRAIT)        */}
      {/* ------------------------------------------------------------- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #rkkd-banprov-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #rkkd-banprov-print-mount-root {
            display: block !important;
            visibility: visible !important;
          }

          #rkkd-banprov-print-document {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Cambria, "Times New Roman", serif !important;
          }

          #rkkd-banprov-print-document * {
            visibility: visible !important;
            box-sizing: border-box !important;
          }

          #rkkd-banprov-print-document table {
            display: table !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }

          #rkkd-banprov-print-document td, #rkkd-banprov-print-document th {
            font-size: 7.5pt !important;
            padding: 3px 4px !important;
            word-break: break-word !important;
          }

          @page {
            size: 215.9mm 330.2mm portrait;
            margin: 5mm 6mm;
          }
        }
        `
      }} />

      <SafePrintPortal portalId="rkkd-banprov-print-mount-root">
        <div id="rkkd-banprov-print-document">
          <div className="bg-white mx-auto text-black font-serif text-[8pt] leading-snug box-border w-[195.9mm]">
            {renderOfficialDocument()}
          </div>
        </div>
      </SafePrintPortal>

      {/* ------------------------------------------------------------- */}
      {/* 6. MODAL TAMBAH / EDIT ITEM BANPROV                           */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Award size={18} className="text-indigo-600" /> {editingItem ? "Edit Item RKKD BANPROV" : "Tambah Item RKKD BANPROV"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Bidang BANPROV</label>
                <select
                  value={newCategoryGroup}
                  onChange={(e) => setNewCategoryGroup(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border font-bold"
                >
                  <option value="INFRASTRUKTUR">A. INFRASTRUKTUR DESA</option>
                  <option value="NON-INFRASTRUKTUR">B. NON-INFRASTRUKTUR / PEMBERDAYAAN</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prasarana / Uraian Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={newPrasarana}
                  onChange={(e) => setNewPrasarana(e.target.value)}
                  placeholder="Contoh: Rehabilitasi Ruang Pelayanan Publik Desa"
                  className="w-full p-2.5 rounded-xl border font-semibold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Volume Kegiatan</label>
                  <input
                    type="text"
                    value={newVol}
                    onChange={(e) => setNewVol(e.target.value)}
                    placeholder="Contoh: 1 PAKET"
                    className="w-full p-2.5 rounded-xl border font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    value={newLokasi}
                    onChange={(e) => setNewLokasi(e.target.value)}
                    placeholder="Contoh: Desa Cimanggu I"
                    className="w-full p-2.5 rounded-xl border font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Anggaran BANPROV (Rp) *</label>
                <input
                  type="number"
                  required
                  value={newAnggaran || ""}
                  onChange={(e) => setNewAnggaran(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2.5 rounded-xl border font-mono font-black text-indigo-700 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border text-slate-600 font-bold cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"><Save size={14} /> Simpan Item BANPROV</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
