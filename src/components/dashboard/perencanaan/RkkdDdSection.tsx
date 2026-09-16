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
  Building2,
  Search,
  Table,
  FileText,
  Pencil,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

import { getRkkdPagus, updateRkkdPagu } from "@/lib/rkkdStore";

export interface RkkdDdItem {
  id: string;
  no: number;
  prasarana: string;
  vol: string;
  lokasi: string;
  anggaran: number;
  sumberDana: "DD";
  ket?: string;
}

const defaultDdList: RkkdDdItem[] = [
  { id: "dd-1", no: 1, prasarana: "PMT BALITA", vol: "7 Pos x 12 bln x 335,000", lokasi: "Desa Cimanggu I", anggaran: 28140000, sumberDana: "DD" },
  { id: "dd-2", no: 2, prasarana: "PMT IBU HAMIL", vol: "7 Pos x 12 bln x 235,000", lokasi: "Desa Cimanggu I", anggaran: 19740000, sumberDana: "DD" },
  { id: "dd-3", no: 3, prasarana: "OPS. KADER KPM", vol: "12 bln x 725,000", lokasi: "Desa Cimanggu I", anggaran: 8700000, sumberDana: "DD" },
  { id: "dd-4", no: 4, prasarana: "INSENTIF POSYANDU", vol: "38 org x 12 bln x 125,000", lokasi: "Desa Cimanggu I", anggaran: 57000000, sumberDana: "DD" },
  { id: "dd-5", no: 5, prasarana: "KEGIATAN KETAHANAN PANGAN", vol: "1 PAKET", lokasi: "Desa Cimanggu I", anggaran: 266317000, sumberDana: "DD" },
  { id: "dd-6", no: 6, prasarana: "BIAYA OPERASIONAL PEMDES", vol: "1 PAKET", lokasi: "Desa Cimanggu I", anggaran: 45921000, sumberDana: "DD" },
  { id: "dd-7", no: 7, prasarana: "BLT - DD", vol: "63 KPM X 300.000", lokasi: "Desa Cimanggu I", anggaran: 226800000, sumberDana: "DD" },
  { id: "dd-8", no: 9, prasarana: "JALING DAN PELENGKAP (TPT)", vol: "173 X 1 X 0,05 M", lokasi: "RT. 01/05", anggaran: 102641000, sumberDana: "DD" },
  { id: "dd-9", no: 10, prasarana: "JALING", vol: "163 X 1 X 0,10 M", lokasi: "RT.02/05", anggaran: 41220000, sumberDana: "DD" },
  { id: "dd-10", no: 11, prasarana: "JALING", vol: "407 X 1 X 0,10 M", lokasi: "RT. 03/05", anggaran: 85452000, sumberDana: "DD" },
  { id: "dd-11", no: 12, prasarana: "JALING", vol: "248 X 0,80 X 0,05 M", lokasi: "RT. 01/03", anggaran: 48765000, sumberDana: "DD" },
  { id: "dd-12", no: 13, prasarana: "JALING", vol: "441 X 0,80 X 0,10 M", lokasi: "RT. 02/03", anggaran: 99761000, sumberDana: "DD" },
  { id: "dd-13", no: 14, prasarana: "JALING", vol: "619 X 1,2 X 0,05 M", lokasi: "RT. 003/003", anggaran: 87234000, sumberDana: "DD" },
  { id: "dd-14", no: 15, prasarana: "JALING DAN PELENGKAP (TPT)", vol: "281 X 1 X 0,10 M", lokasi: "RT. 02/08", anggaran: 150648000, sumberDana: "DD" },
  { id: "dd-15", no: 16, prasarana: "JALING DAN PELENGKAP (TPT)", vol: "100 X 1 X 0,10", lokasi: "RT. 04/01", anggaran: 34757000, sumberDana: "DD" },
  { id: "dd-16", no: 17, prasarana: "DRAINASE", vol: "100 X 1 X 0,5", lokasi: "RT. 01/09", anggaran: 35000000, sumberDana: "DD" },
  { id: "dd-17", no: 18, prasarana: "PJU", vol: "10 UNIT", lokasi: "Desa Cimanggu I", anggaran: 110000000, sumberDana: "DD" },
  { id: "dd-18", no: 19, prasarana: "STUNTING", vol: "-", lokasi: "Desa Cimanggu I", anggaran: 16200000, sumberDana: "DD" },
  { id: "dd-19", no: 21, prasarana: "PELATIHAN LKD", vol: "-", lokasi: "Desa Cimanggu I", anggaran: 16427000, sumberDana: "DD" },
  { id: "dd-20", no: 22, prasarana: "RTLH", vol: "-", lokasi: "Desa Cimanggu I", anggaran: 30000000, sumberDana: "DD" },
  { id: "dd-21", no: 23, prasarana: "DESTANA", vol: "-", lokasi: "Desa Cimanggu I", anggaran: 10000000, sumberDana: "DD" },
  { id: "dd-22", no: 24, prasarana: "PENYERTAAN MODAL BUMDES", vol: "1 KEGIATAN", lokasi: "Desa Cimanggu I", anggaran: 10000000, sumberDana: "DD" }
];

export function RkkdDdSection() {
  const [items, setItems] = useState<RkkdDdItem[]>(defaultDdList);
  const [paguDd, setPaguDd] = useState<number>(1530900000);
  const [isEditingPagu, setIsEditingPagu] = useState(false);
  const [paguInputVal, setPaguInputVal] = useState<number>(1530900000);

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "print-preview">("table");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RkkdDdItem | null>(null);
  const [newPrasarana, setNewPrasarana] = useState("");
  const [newVol, setNewVol] = useState("");
  const [newLokasi, setNewLokasi] = useState("RT. 01/01");
  const [newAnggaran, setNewAnggaran] = useState<number>(0);
  const [newKet, setNewKet] = useState("");

  useEffect(() => {
    setMounted(true);
    const initial = getRkkdPagus().DDS;
    setPaguDd(initial);
    setPaguInputVal(initial);

    const handleSync = () => {
      const current = getRkkdPagus().DDS;
      setPaguDd(current);
    };
    window.addEventListener("rkkd_pagu_updated", handleSync);
    return () => window.removeEventListener("rkkd_pagu_updated", handleSync);
  }, []);

  useEffect(() => {
    if (mounted) {
      updateRkkdPagu("DDS", paguDd);
    }
  }, [paguDd, items, mounted]);

  const handleSavePagu = () => {
    if (paguInputVal > 0) {
      setPaguDd(paguInputVal);
      updateRkkdPagu("DDS", paguInputVal);
    }
    setIsEditingPagu(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNewPrasarana("");
    setNewVol("");
    setNewLokasi("Desa Cimanggu I");
    setNewAnggaran(0);
    setNewKet("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: RkkdDdItem) => {
    setEditingItem(item);
    setNewPrasarana(item.prasarana);
    setNewVol(item.vol);
    setNewLokasi(item.lokasi);
    setNewAnggaran(item.anggaran);
    setNewKet(item.ket || "");
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus item RKKD DD ini?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrasarana || !newAnggaran) return;

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? {
        ...i,
        prasarana: newPrasarana.toUpperCase(),
        vol: newVol || "1 PAKET",
        lokasi: newLokasi,
        anggaran: Number(newAnggaran) || 0,
        ket: newKet
      } : i));
    } else {
      const newItem: RkkdDdItem = {
        id: `dd-${Date.now()}`,
        no: items.length + 1,
        prasarana: newPrasarana.toUpperCase(),
        vol: newVol || "1 PAKET",
        lokasi: newLokasi,
        anggaran: Number(newAnggaran) || 0,
        sumberDana: "DD",
        ket: newKet
      };
      setItems(prev => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  const totalAnggaran = items.reduce((acc, curr) => acc + curr.anggaran, 0);
  const sisaPagu = paguDd - totalAnggaran;
  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

  const filteredItems = items.filter(i => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchP = i.prasarana.toLowerCase().includes(q);
      const matchL = i.lokasi.toLowerCase().includes(q);
      const matchV = i.vol.toLowerCase().includes(q);
      if (!matchP && !matchL && !matchV) return false;
    }
    return true;
  });

  const renderDdDocument = (isPortal = false) => (
    <div
      id={isPortal ? "rkkd-dd-print-portal" : "rkkd-dd-print"}
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
        <div>DANA DESA (DD TRANSFER APBN) TAHUN ANGGARAN 2026</div>
        <div>DESA CIMANGGU I KECAMATAN CIBUNGBULANG KABUPATEN BOGOR</div>
      </div>

      <div className="flex justify-between items-center text-[10pt] font-extrabold mb-3 bg-emerald-100 p-2 border border-black">
        <div>Pagu Dana Desa: Rp {formatRupiah(paguDd)}</div>
        <div>Total Penggunaan: Rp {formatRupiah(totalAnggaran)}</div>
        <div className={sisaPagu === 0 ? "text-emerald-900" : "text-rose-900"}>Sisa: Rp {formatRupiah(sisaPagu)}</div>
      </div>

      <table className="w-full border-collapse border border-black text-[9pt] table-fixed mb-6">
        <thead>
          <tr className="bg-slate-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1.5 w-[35px]">NO</th>
            <th className="border border-black p-1.5">PRASARANA / URAIAN KEGIATAN</th>
            <th className="border border-black p-1.5 w-[110px]">VOLUME</th>
            <th className="border border-black p-1.5 w-[100px]">LOKASI</th>
            <th className="border border-black p-1.5 w-[120px]">ANGGARAN (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b border-black h-[24px]">
              <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
              <td className="border border-black p-1 pl-2 font-medium">{item.prasarana}</td>
              <td className="border border-black p-1 text-center font-mono">{item.vol}</td>
              <td className="border border-black p-1 text-center">{item.lokasi}</td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-2">{formatRupiah(item.anggaran)}</td>
            </tr>
          ))}

          <tr className="bg-emerald-600 text-white font-black text-[10.5pt] border-b border-black">
            <td className="border border-black p-2 text-center uppercase" colSpan={4}>
              TOTAL KESELURUHAN RKKD DANA DESA (DD)
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
          #rkkd-dd-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #rkkd-dd-print-mount-root {
            display: block !important;
            visibility: visible !important;
          }

          #rkkd-dd-print-portal {
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

          #rkkd-dd-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
            box-sizing: border-box !important;
          }

          #rkkd-dd-print-portal table {
            display: table !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }

          #rkkd-dd-print-portal tr {
            display: table-row !important;
          }

          #rkkd-dd-print-portal td, #rkkd-dd-print-portal th {
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

      {/* TOP SUMMARY CARDS FOR RKKD DD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {/* PAGU CARD WITH MANUAL INPUT */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-xl border border-emerald-500/30 relative">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block">Pagu RKKD Dana Desa (DD) 2026</span>
            <button
              onClick={() => {
                setPaguInputVal(paguDd);
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
            <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(paguDd)}</div>
          )}

          <span className="text-[11px] text-emerald-100 mt-2 block">Transfer APBN Pusat (Dapat Diubah)</span>
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-cyan-700 text-white rounded-3xl p-5 shadow-xl border border-teal-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-100 block mb-1">Total Penggunaan RKKD DD</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalAnggaran)}</div>
          <span className="text-[11px] text-teal-100 mt-2 block">{items.length} Kegiatan Terdaftar</span>
        </div>

        <div className={`rounded-3xl p-5 text-white shadow-xl border ${
          sisaPagu === 0 
            ? "bg-slate-900 border-slate-700" 
            : sisaPagu < 0 
              ? "bg-gradient-to-br from-rose-600 to-red-700 border-rose-500/30" 
              : "bg-gradient-to-br from-amber-600 to-orange-700 border-amber-500/30"
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">Sisa / Balance Pagu DD</span>
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
                  Total rincian penggunaan (Rp {formatRupiah(totalAnggaran)}) melebihi batas pagu (Rp {formatRupiah(paguDd)}). Terjadi defisit sebesar <span className="font-mono font-bold text-rose-900">Rp {formatRupiah(Math.abs(sisaPagu))}</span>. Mohon sesuaikan item kegiatan atau perbarui Pagu.
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
                  Masih terdapat sisa alokasi pagu anggaran sebesar <span className="font-mono font-bold text-amber-950">Rp {formatRupiah(sisaPagu)}</span> yang belum dimasukkan ke rincian kegiatan RKKD DD.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-emerald-900 text-sm">✅ ANGGARAN RKKD DD BALANCE 100%!</h4>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Seluruh alokasi pagu anggaran (Rp {formatRupiah(paguDd)}) telah terserap secara presisi dan sempurna.
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
              <Table size={14} className={viewMode === "table" ? "text-emerald-600" : ""} />
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
              <FileText size={14} className={viewMode === "print-preview" ? "text-teal-600" : ""} />
              <span>Preview Format Cetak (F4)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Plus size={16} />
            <span>Tambah Kegiatan DD</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Printer size={16} />
            <span>Cetak Dokumen RKKD DD (F4)</span>
          </button>
        </div>
      </div>

      {/* FRONT VIEW: INTERACTIVE DATA TABLE VS PRINT PREVIEW */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari prasarana / lokasi kegiatan DD..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 bg-white"
              />
            </div>
            <div className="text-xs font-bold text-slate-500">
              Total: {filteredItems.length} Kegiatan
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5 min-w-[220px]">Prasarana / Uraian Kegiatan</th>
                  <th className="p-3.5 text-center min-w-[140px]">Volume</th>
                  <th className="p-3.5 text-center min-w-[120px]">Lokasi</th>
                  <th className="p-3.5 text-right min-w-[160px]">Nilai Anggaran (Rp)</th>
                  <th className="p-3.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      Tidak ada data kegiatan RKKD DD yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">{item.prasarana}</td>
                      <td className="p-3.5 text-center font-mono font-semibold">{item.vol}</td>
                      <td className="p-3.5 text-center font-medium">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {item.lokasi}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-emerald-600 text-sm">
                        Rp {formatRupiah(item.anggaran)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 border border-amber-200 transition-all cursor-pointer"
                            title="Edit Kegiatan DD"
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
                  <td colSpan={4} className="p-3.5 text-right uppercase tracking-wider">
                    Total Keseluruhan Dana Desa (DD):
                  </td>
                  <td className="p-3.5 text-right font-mono text-emerald-400 text-sm font-black">
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
            --- Preview Dokumen Resmi RKKD Dana Desa (Kertas F4 Cambria) ---
          </span>
          {renderDdDocument(false)}
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
                    <span>Edit Kegiatan RKKD DD</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="text-emerald-600" />
                    <span>Tambah Kegiatan RKKD DD</span>
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
                <label className="block font-bold text-slate-700 mb-1">Prasarana / Uraian Kegiatan</label>
                <input
                  type="text"
                  required
                  value={newPrasarana}
                  onChange={(e) => setNewPrasarana(e.target.value)}
                  placeholder="Contoh: BETONISASI JALAN DESA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-emerald-500"
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
                    placeholder="Contoh: 173 X 1 X 0.05 M"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    required
                    value={newLokasi}
                    onChange={(e) => setNewLokasi(e.target.value)}
                    placeholder="Contoh: RT. 01/05"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
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
                  placeholder="Contoh: 50000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-emerald-500"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  {editingItem ? <Save size={14} /> : <Plus size={14} />}
                  <span>{editingItem ? "Simpan Perubahan" : "Simpan Ke Tabel DD"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT CONTAINER */}
      <SafePrintPortal portalId="rkkd-dd-print-mount-root">
        {renderDdDocument(true)}
      </SafePrintPortal>
    </div>
  );
}
