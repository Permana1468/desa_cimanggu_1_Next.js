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
  TrendingUp,
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

export interface RkkdBankeuItem {
  id: string;
  no: number;
  categoryGroup: "INFRASTRUKTUR" | "NON-INFRASTRUKTUR";
  prasarana: string;
  vol: string;
  lokasi: string;
  anggaran: number;
  sumberDana: "BANKEU";
  ket?: string;
}

const defaultBankeuList: RkkdBankeuItem[] = [
  // INFRASTRUKTUR
  { id: "bk-1", no: 1, categoryGroup: "INFRASTRUKTUR", prasarana: "BETONISASI JALAN DESA DAN PELENGKAP (TPT)", vol: "170 x 2,3 x 0,15", lokasi: "003/007", anggaran: 222984000, sumberDana: "BANKEU" },
  { id: "bk-2", no: 2, categoryGroup: "INFRASTRUKTUR", prasarana: "HOTMIX DAN PELENGKAP (DRAINASE)", vol: "130 x 2,3 x 0,03", lokasi: "001/007", anggaran: 284297000, sumberDana: "BANKEU" },
  { id: "bk-3", no: 3, categoryGroup: "INFRASTRUKTUR", prasarana: "HOTMIX DAN PELENGKAP (TPT)", vol: "250 x 2,7 x 0,03", lokasi: "002/009", anggaran: 329747000, sumberDana: "BANKEU" },
  { id: "bk-4", no: 4, categoryGroup: "INFRASTRUKTUR", prasarana: "PEMBANGUNAN DPT", vol: "30 x 6", lokasi: "001/005", anggaran: 226192000, sumberDana: "BANKEU" },

  // NON-INFRASTRUKTUR
  { id: "bk-5", no: 1, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "DESA SIAGA TBC", vol: "1 PAKET", lokasi: "Cimanggu I", anggaran: 80900000, sumberDana: "BANKEU" },
  { id: "bk-6", no: 2, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "BPJS KETENAGAKERJAAN", vol: "250 ORANG", lokasi: "Cimanggu I", anggaran: 50400000, sumberDana: "BANKEU" },
  { id: "bk-7", no: 3, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "1 SARJANA 1 DESA", vol: "2 ORANG", lokasi: "Cimanggu I", anggaran: 20000000, sumberDana: "BANKEU" },
  { id: "bk-8", no: 4, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "DATA DIGITAL DESA", vol: "1 PAKET", lokasi: "Cimanggu I", anggaran: 63000000, sumberDana: "BANKEU" },
  { id: "bk-9", no: 5, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "PENGELOLAAN SAMPAH", vol: "1 PAKET", lokasi: "Cimanggu I", anggaran: 172445000, sumberDana: "BANKEU" },
  { id: "bk-10", no: 6, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "PEMBERDAYAAN KEMASYARAKATAN DESA", vol: "1 PAKET", lokasi: "Cimanggu I", anggaran: 27619000, sumberDana: "BANKEU" },
  { id: "bk-11", no: 7, categoryGroup: "NON-INFRASTRUKTUR", prasarana: "GERAKAN PANGAN MURAH (GPM)", vol: "3 KEGIATAN", lokasi: "Cimanggu I", anggaran: 22416000, sumberDana: "BANKEU" }
];

export function RkkdBankeuSection() {
  const [items, setItems] = useState<RkkdBankeuItem[]>(defaultBankeuList);
  const [paguBankeu, setPaguBankeu] = useState<number>(1500000000);
  const [isEditingPagu, setIsEditingPagu] = useState(false);
  const [paguInputVal, setPaguInputVal] = useState<number>(1500000000);

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "print-preview">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "INFRASTRUKTUR" | "NON-INFRASTRUKTUR">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RkkdBankeuItem | null>(null);
  const [newCategoryGroup, setNewCategoryGroup] = useState<"INFRASTRUKTUR" | "NON-INFRASTRUKTUR">("INFRASTRUKTUR");
  const [newPrasarana, setNewPrasarana] = useState("");
  const [newVol, setNewVol] = useState("");
  const [newLokasi, setNewLokasi] = useState("Cimanggu I");
  const [newAnggaran, setNewAnggaran] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    const initial = getRkkdPagus().PBK;
    setPaguBankeu(initial);
    setPaguInputVal(initial);

    const handleSync = () => {
      const current = getRkkdPagus().PBK;
      setPaguBankeu(current);
    };
    window.addEventListener("rkkd_pagu_updated", handleSync);
    return () => window.removeEventListener("rkkd_pagu_updated", handleSync);
  }, []);

  useEffect(() => {
    if (mounted) {
      updateRkkdPagu("PBK", paguBankeu);
    }
  }, [paguBankeu, items, mounted]);

  const handleSavePagu = () => {
    if (paguInputVal > 0) {
      setPaguBankeu(paguInputVal);
      updateRkkdPagu("PBK", paguInputVal);
    }
    setIsEditingPagu(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNewCategoryGroup("INFRASTRUKTUR");
    setNewPrasarana("");
    setNewVol("");
    setNewLokasi("Cimanggu I");
    setNewAnggaran(0);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RkkdBankeuItem) => {
    setEditingItem(item);
    setNewCategoryGroup(item.categoryGroup);
    setNewPrasarana(item.prasarana);
    setNewVol(item.vol);
    setNewLokasi(item.lokasi);
    setNewAnggaran(item.anggaran);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus item RKKD BANKEU ini?")) {
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
      const groupItems = items.filter(i => i.categoryGroup === newCategoryGroup);
      const newItem: RkkdBankeuItem = {
        id: `bk-${Date.now()}`,
        no: groupItems.length + 1,
        categoryGroup: newCategoryGroup,
        prasarana: newPrasarana.toUpperCase(),
        vol: newVol || "1 PAKET",
        lokasi: newLokasi,
        anggaran: Number(newAnggaran) || 0,
        sumberDana: "BANKEU"
      };
      setItems(prev => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  const totalInfra = items.filter(i => i.categoryGroup === "INFRASTRUKTUR").reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalNonInfra = items.filter(i => i.categoryGroup === "NON-INFRASTRUKTUR").reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalAnggaran = totalInfra + totalNonInfra;
  const sisaPagu = paguBankeu - totalAnggaran;

  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

  const filteredItems = items.filter(i => {
    if (selectedCategory !== "ALL" && i.categoryGroup !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchP = i.prasarana.toLowerCase().includes(q);
      const matchL = i.lokasi.toLowerCase().includes(q);
      if (!matchP && !matchL) return false;
    }
    return true;
  });

  const renderBankeuDocument = (isPortal = false) => (
    <div
      id={isPortal ? "rkkd-bankeu-print-portal" : "rkkd-bankeu-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative"
      style={{
        width: "215.9mm",
        minHeight: "330.2mm",
        padding: "15mm 15mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "9.5pt",
        lineHeight: "1.3"
      }}
    >
      <div className="text-center font-extrabold text-[12pt] mb-4 uppercase tracking-wide leading-snug">
        <div>RENCANA KEGIATAN KERJA DESA (RKKD)</div>
        <div>BANTUAN KEUANGAN (BANKEU) TAHUN ANGGARAN 2026</div>
        <div>DESA CIMANGGU I KECAMATAN CIBUNGBULANG KABUPATEN BOGOR</div>
      </div>

      <div className="flex justify-between items-center text-[10pt] font-extrabold mb-3 bg-cyan-100 p-2 border border-black">
        <div>Pagu Bantuan Keuangan: Rp {formatRupiah(paguBankeu)}</div>
        <div>Total Penggunaan: Rp {formatRupiah(totalAnggaran)}</div>
        <div className={sisaPagu === 0 ? "text-cyan-950" : "text-rose-900"}>Sisa: Rp {formatRupiah(sisaPagu)}</div>
      </div>

      <table className="w-full border-collapse border border-black text-[9pt] table-fixed mb-6">
        <thead>
          <tr className="bg-slate-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1.5 w-[35px]">NO</th>
            <th className="border border-black p-1.5">PRASARANA / URAIAN KEGIATAN</th>
            <th className="border border-black p-1.5 w-[110px]">VOLUME</th>
            <th className="border border-black p-1.5 w-[90px]">LOKASI</th>
            <th className="border border-black p-1.5 w-[120px]">ANGGARAN (Rp)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-cyan-50 font-bold border-b border-black">
            <td className="border border-black p-1 text-center font-black">A</td>
            <td className="border border-black p-1 uppercase font-extrabold" colSpan={3}>
              BIDANG INFRASTRUKTUR DESA
            </td>
            <td className="border border-black p-1 text-right font-mono font-bold pr-2">{formatRupiah(totalInfra)}</td>
          </tr>
          {items.filter(i => i.categoryGroup === "INFRASTRUKTUR").map((item, idx) => (
            <tr key={item.id} className="border-b border-black h-[24px]">
              <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
              <td className="border border-black p-1 pl-2 font-medium">{item.prasarana}</td>
              <td className="border border-black p-1 text-center font-mono">{item.vol}</td>
              <td className="border border-black p-1 text-center">{item.lokasi}</td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-2">{formatRupiah(item.anggaran)}</td>
            </tr>
          ))}

          <tr className="bg-cyan-50 font-bold border-b border-black">
            <td className="border border-black p-1 text-center font-black">B</td>
            <td className="border border-black p-1 uppercase font-extrabold" colSpan={3}>
              BIDANG NON-INFRASTRUKTUR DESA
            </td>
            <td className="border border-black p-1 text-right font-mono font-bold pr-2">{formatRupiah(totalNonInfra)}</td>
          </tr>
          {items.filter(i => i.categoryGroup === "NON-INFRASTRUKTUR").map((item, idx) => (
            <tr key={item.id} className="border-b border-black h-[24px]">
              <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
              <td className="border border-black p-1 pl-2 font-medium">{item.prasarana}</td>
              <td className="border border-black p-1 text-center font-mono">{item.vol}</td>
              <td className="border border-black p-1 text-center">{item.lokasi}</td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-2">{formatRupiah(item.anggaran)}</td>
            </tr>
          ))}

          <tr className="bg-cyan-600 text-white font-black text-[10.5pt] border-b border-black">
            <td className="border border-black p-2 text-center uppercase" colSpan={4}>
              TOTAL KESELURUHAN RKKD BANTUAN KEUANGAN (BANKEU)
            </td>
            <td className="border border-black p-2 text-right font-mono pr-2 font-black">{formatRupiah(totalAnggaran)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CSS PRINT RULES */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #rkkd-bankeu-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #rkkd-bankeu-print-mount-root {
            display: block !important;
            visibility: visible !important;
          }

          #rkkd-bankeu-print-portal {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #rkkd-bankeu-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
            box-sizing: border-box !important;
          }

          #rkkd-bankeu-print-portal table {
            display: table !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }

          #rkkd-bankeu-print-portal tr {
            display: table-row !important;
          }

          #rkkd-bankeu-print-portal td, #rkkd-bankeu-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
            font-size: 7.5pt !important;
            padding: 3px 4px !important;
            word-break: break-word !important;
          }

          @page {
            size: 215.9mm 330.2mm portrait;
            margin: 5mm 6mm;
          }
        }
      `}} />

      {/* TOP SUMMARY CARDS FOR RKKD BANKEU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {/* PAGU CARD WITH MANUAL INPUT */}
        <div className="bg-gradient-to-br from-cyan-600 to-sky-700 text-white rounded-3xl p-5 shadow-xl border border-cyan-500/30 relative">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-100 block">Pagu RKKD BANKEU 2026</span>
            <button
              onClick={() => {
                setPaguInputVal(paguBankeu);
                setIsEditingPagu(true);
              }}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Edit Pagu Manually"
            >
              <Pencil size={13} />
              <span>Input Pagu</span>
            </button>
          </div>

          {isEditingPagu ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-sm">Rp</span>
              <input
                type="number"
                value={paguInputVal || ""}
                onChange={(e) => setPaguInputVal(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-white text-slate-900 font-mono font-bold text-lg focus:outline-none"
                placeholder="Masukkan nilai pagu"
              />
              <button
                onClick={handleSavePagu}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
              >
                <Save size={14} />
              </button>
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(paguBankeu)}</div>
          )}

          <span className="text-[11px] text-cyan-100 mt-2 block">Bantuan Keuangan Kab/Prov (Dapat Diubah)</span>
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-cyan-800 text-white rounded-3xl p-5 shadow-xl border border-cyan-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-100 block mb-1">Total Penggunaan BANKEU</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalAnggaran)}</div>
          <span className="text-[11px] text-cyan-100 mt-2 block">Infra: Rp {formatRupiah(totalInfra)} | Non-Infra: Rp {formatRupiah(totalNonInfra)}</span>
        </div>

        <div className={`rounded-3xl p-5 text-white shadow-xl border ${
          sisaPagu === 0 
            ? "bg-slate-900 border-slate-700" 
            : sisaPagu < 0 
              ? "bg-gradient-to-br from-rose-600 to-red-700 border-rose-500/30" 
              : "bg-gradient-to-br from-amber-600 to-orange-700 border-amber-500/30"
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">Sisa / Balance Pagu BANKEU</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(sisaPagu)}</div>
          <span className="text-[11px] text-slate-200 mt-2 block font-semibold">
            {sisaPagu === 0 ? "✅ Klop Balance 100%!" : sisaPagu < 0 ? "🚨 Over Budget / Defisit!" : "⚠️ Masih Ada Sisa Anggaran"}
          </span>
        </div>
      </div>

      {/* DYNAMIC BALANCE STATUS ALERT BANNERS */}
      <div className="no-print">
        {sisaPagu < 0 ? (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-rose-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-rose-900 text-sm">🚨 PERINGATAN KRITIS: Penggunaan Anggaran Melebihi Pagu (Defisit)!</h4>
                <p className="text-xs text-rose-700 font-medium mt-0.5">
                  Total rincian penggunaan (Rp {formatRupiah(totalAnggaran)}) melebihi batas pagu (Rp {formatRupiah(paguBankeu)}). Terjadi defisit sebesar <span className="font-mono font-bold text-rose-900">Rp {formatRupiah(Math.abs(sisaPagu))}</span>. Mohon sesuaikan item kegiatan atau perbarui Pagu.
                </p>
              </div>
            </div>
          </div>
        ) : sisaPagu > 0 ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-amber-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-amber-900 text-sm">⚠️ PERINGATAN: Penggunaan Anggaran Belum Balance!</h4>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  Masih terdapat sisa alokasi pagu anggaran sebesar <span className="font-mono font-bold text-amber-950">Rp {formatRupiah(sisaPagu)}</span> yang belum dimasukkan ke rincian kegiatan BANKEU.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-cyan-50 border-2 border-cyan-300 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-cyan-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-cyan-900 text-sm">✅ ANGGARAN RKKD BANKEU BALANCE 100%!</h4>
                <p className="text-xs text-cyan-800 font-medium mt-0.5">
                  Seluruh alokasi pagu anggaran (Rp {formatRupiah(paguBankeu)}) telah terserap secara presisi dan sempurna.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACTION & CONTROL BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table size={14} className={viewMode === "table" ? "text-cyan-600" : ""} />
              <span>Tabel Data Interaktif</span>
            </button>
            <button
              onClick={() => setViewMode("print-preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "print-preview"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={14} className={viewMode === "print-preview" ? "text-cyan-600" : ""} />
              <span>Preview Format Cetak (F4)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Plus size={16} />
            <span>Tambah Item BANKEU</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Printer size={16} />
            <span>Cetak Dokumen BANKEU (F4)</span>
          </button>
        </div>
      </div>

      {/* FRONT VIEW: INTERACTIVE DATA TABLE VS PRINT PREVIEW */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari prasarana / uraian BANKEU..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-cyan-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Semua Bidang ({items.length} Item)</option>
                <option value="INFRASTRUKTUR">Bidang Infrastruktur</option>
                <option value="NON-INFRASTRUKTUR">Bidang Non-Infrastruktur</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5 min-w-[160px]">Kategori Bidang</th>
                  <th className="p-3.5 min-w-[220px]">Prasarana / Uraian Kegiatan</th>
                  <th className="p-3.5 text-center min-w-[130px]">Volume</th>
                  <th className="p-3.5 text-center min-w-[110px]">Lokasi</th>
                  <th className="p-3.5 text-right min-w-[160px]">Nilai Anggaran (Rp)</th>
                  <th className="p-3.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      Tidak ada data kegiatan BANKEU yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-cyan-50/40 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded font-bold text-[11px] ${
                          item.categoryGroup === "INFRASTRUKTUR" 
                            ? "bg-cyan-100 text-cyan-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {item.categoryGroup}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{item.prasarana}</td>
                      <td className="p-3.5 text-center font-mono font-semibold">{item.vol}</td>
                      <td className="p-3.5 text-center font-medium">{item.lokasi}</td>
                      <td className="p-3.5 text-right font-mono font-black text-cyan-600 text-sm">
                        Rp {formatRupiah(item.anggaran)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 border border-amber-200 transition-all cursor-pointer"
                            title="Edit Item BANKEU"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 transition-all cursor-pointer"
                            title="Hapus Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-extrabold text-xs">
                  <td colSpan={5} className="p-3.5 text-right uppercase tracking-wider">
                    Total Keseluruhan Bantuan Keuangan (BANKEU):
                  </td>
                  <td className="p-3.5 text-right font-mono text-cyan-300 text-sm font-black">
                    Rp {formatRupiah(totalAnggaran)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
          <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            --- Preview Dokumen Resmi RKKD Bantuan Keuangan (Kertas F4 Cambria) ---
          </span>
          {renderBankeuDocument(false)}
        </div>
      )}

      {/* CREATE & EDIT MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                {editingItem ? (
                  <>
                    <Pencil size={18} className="text-amber-600" />
                    <span>Edit Kegiatan RKKD BANKEU</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="text-cyan-600" />
                    <span>Tambah Kegiatan RKKD BANKEU</span>
                  </>
                )}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Bidang BANKEU</label>
                <select
                  value={newCategoryGroup}
                  onChange={(e) => setNewCategoryGroup(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="INFRASTRUKTUR">BIDANG INFRASTRUKTUR DESA</option>
                  <option value="NON-INFRASTRUKTUR">BIDANG NON-INFRASTRUKTUR DESA</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prasarana / Uraian Kegiatan</label>
                <input
                  type="text"
                  required
                  value={newPrasarana}
                  onChange={(e) => setNewPrasarana(e.target.value)}
                  placeholder="Contoh: BETONISASI JALAN DESA DAN PELENGKAP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Volume</label>
                  <input
                    type="text"
                    required
                    value={newVol}
                    onChange={(e) => setNewVol(e.target.value)}
                    placeholder="Contoh: 170 x 2,3 x 0,15"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    required
                    value={newLokasi}
                    onChange={(e) => setNewLokasi(e.target.value)}
                    placeholder="Contoh: 003/007"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Anggaran (Rp)</label>
                <input
                  type="number"
                  required
                  value={newAnggaran || ""}
                  onChange={(e) => setNewAnggaran(Number(e.target.value))}
                  placeholder="Contoh: 222984000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  {editingItem ? <Save size={14} /> : <Plus size={14} />}
                  <span>{editingItem ? "Simpan Perubahan" : "Simpan Ke Tabel BANKEU"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT CONTAINER */}
      <SafePrintPortal portalId="rkkd-bankeu-print-mount-root">
        {renderBankeuDocument(true)}
      </SafePrintPortal>
    </div>
  );
}
