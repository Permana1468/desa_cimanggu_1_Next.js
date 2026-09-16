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
  Layers,
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

export interface RkkdBhprdItem {
  id: string;
  no: number;
  bidangGroup: string; // e.g. "I. PENYELENGGARAAN PEMERINTAHAN DESA"
  kodeRekening: string;
  uraianKegiatan: string;
  besarnyaBiaya: number;
  tahap1: number; // 50%
  tahap2: number; // 25%
  tahap3: number; // 25%
  keterangan: string;
  sumberDana: "BHPRD";
}

const defaultBhprdList: RkkdBhprdItem[] = [
  // I. Penyelenggaraan Pemdes
  { id: "bh-1", no: 1, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "1", uraianKegiatan: "TUNJANGAN KINERJA KEPALA DESA", besarnyaBiaya: 12000000, tahap1: 6000000, tahap2: 3000000, tahap3: 3000000, keterangan: "per bulan", sumberDana: "BHPRD" },
  { id: "bh-2", no: 2, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "1", uraianKegiatan: "TUNJANGAN HARI RAYA KEPALA DESA", besarnyaBiaya: 5000000, tahap1: 5000000, tahap2: 0, tahap3: 0, keterangan: "PER KEGIATAN", sumberDana: "BHPRD" },
  { id: "bh-3", no: 3, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "2", uraianKegiatan: "TUNJANGAN KINERJA PERANGKAT DESA", besarnyaBiaya: 36000000, tahap1: 18000000, tahap2: 9000000, tahap3: 9000000, keterangan: "per bulan", sumberDana: "BHPRD" },
  { id: "bh-4", no: 4, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "2", uraianKegiatan: "TUNJANGAN HARI RAYA PERANGKAT DESA", besarnyaBiaya: 17600000, tahap1: 17600000, tahap2: 0, tahap3: 0, keterangan: "PER KEGIATAN", sumberDana: "BHPRD" },
  { id: "bh-5", no: 5, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "3", uraianKegiatan: "IURAN BPJS KETENAGA KERJAAN PERANGKAT DESA", besarnyaBiaya: 19169280, tahap1: 9584640, tahap2: 4792320, tahap3: 4792320, keterangan: "per bulan", sumberDana: "BHPRD" },
  { id: "bh-6", no: 6, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "4", uraianKegiatan: "ATK KANTOR DESA", besarnyaBiaya: 18483619, tahap1: 6027309, tahap2: 3850405, tahap3: 1850405, keterangan: "PER KEGIATAN", sumberDana: "BHPRD" },
  { id: "bh-7", no: 7, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "4", uraianKegiatan: "Langganan Listrik Kantor Desa", besarnyaBiaya: 2436000, tahap1: 1218000, tahap2: 609000, tahap3: 609000, keterangan: "per bulan", sumberDana: "BHPRD" },
  { id: "bh-8", no: 8, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "4", uraianKegiatan: "Langganan Jaringan Internet (INDIHOME)", besarnyaBiaya: 5220000, tahap1: 2610000, tahap2: 1305000, tahap3: 1305000, keterangan: "per bulan", sumberDana: "BHPRD" },
  { id: "bh-9", no: 9, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "4", uraianKegiatan: "HONOR KEBERSIHAN KANTOR DESA (2 Org x 12 bln)", besarnyaBiaya: 19200000, tahap1: 9600000, tahap2: 4800000, tahap3: 4800000, keterangan: "per bulan", sumberDana: "BHPRD" },
  { id: "bh-10", no: 10, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "4", uraianKegiatan: "HONOR SOPIR SIAGA DESA", besarnyaBiaya: 10200000, tahap1: 5100000, tahap2: 2550000, tahap3: 2550000, keterangan: "per bulan", sumberDana: "BHPRD" },
  { id: "bh-11", no: 11, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "5", uraianKegiatan: "PERAWATAN KENDARAAN RODA DUA (3 UNIT)", besarnyaBiaya: 4320000, tahap1: 2160000, tahap2: 1080000, tahap3: 1080000, keterangan: "PER UNIT", sumberDana: "BHPRD" },
  { id: "bh-12", no: 12, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "5", uraianKegiatan: "PERAWATAN KENDARAAN RODA EMPAT (2 UNIT)", besarnyaBiaya: 8000000, tahap1: 4000000, tahap2: 2000000, tahap3: 2000000, keterangan: "PER UNIT", sumberDana: "BHPRD" },
  { id: "bh-13", no: 13, bidangGroup: "I. PENYELENGGARAAN PEMERINTAHAN DESA", kodeRekening: "7", uraianKegiatan: "Rapat Evaluasi Perkembangan Desa (3 Keg.)", besarnyaBiaya: 7500000, tahap1: 0, tahap2: 2500000, tahap3: 2500000, keterangan: "PER KEGIATAN", sumberDana: "BHPRD" },

  // III. Pembinaan Kemasyarakatan
  { id: "bh-14", no: 1, bidangGroup: "III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN", kodeRekening: "13", uraianKegiatan: "PENGAJIAN RUTIN KAUM IBU (11 BULAN)", besarnyaBiaya: 17520000, tahap1: 8100000, tahap2: 4710000, tahap3: 4710000, keterangan: "per kegiatan", sumberDana: "BHPRD" },
  { id: "bh-15", no: 2, bidangGroup: "III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN", kodeRekening: "13", uraianKegiatan: "PENGAJIAN RUTIN KAUM BAPAK (11 BULAN)", besarnyaBiaya: 13395000, tahap1: 6225000, tahap2: 3585000, tahap3: 3585000, keterangan: "per kegiatan", sumberDana: "BHPRD" },
  { id: "bh-16", no: 3, bidangGroup: "III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN", kodeRekening: "13", uraianKegiatan: "PHBI/MAULID NABI", besarnyaBiaya: 12000000, tahap1: 0, tahap2: 12000000, tahap3: 0, keterangan: "per kegiatan", sumberDana: "BHPRD" },
  { id: "bh-17", no: 5, bidangGroup: "III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN", kodeRekening: "13", uraianKegiatan: "PHBN/HUT RI", besarnyaBiaya: 25000000, tahap1: 0, tahap2: 0, tahap3: 25000000, keterangan: "per kegiatan", sumberDana: "BHPRD" },
  { id: "bh-18", no: 7, bidangGroup: "III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN", kodeRekening: "14", uraianKegiatan: "KARANG TARUNA", besarnyaBiaya: 3000000, tahap1: 1500000, tahap2: 750000, tahap3: 750000, keterangan: "per bulan/lembaga", sumberDana: "BHPRD" },
  { id: "bh-19", no: 8, bidangGroup: "III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN", kodeRekening: "15", uraianKegiatan: "LPM", besarnyaBiaya: 28200000, tahap1: 14100000, tahap2: 7050000, tahap3: 7050000, keterangan: "per bulan/lembaga", sumberDana: "BHPRD" },
  { id: "bh-20", no: 9, bidangGroup: "III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN", kodeRekening: "16", uraianKegiatan: "INSENTIF PKK", besarnyaBiaya: 45840000, tahap1: 22920000, tahap2: 11460000, tahap3: 11460000, keterangan: "per bulan/lembaga", sumberDana: "BHPRD" }
];

export function RkkdBhprdSection() {
  const [items, setItems] = useState<RkkdBhprdItem[]>(defaultBhprdList);
  const [paguBhprd, setPaguBhprd] = useState<number>(435351216);
  const [isEditingPagu, setIsEditingPagu] = useState(false);
  const [paguInputVal, setPaguInputVal] = useState<number>(435351216);

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "print-preview">("table");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RkkdBhprdItem | null>(null);
  const [newBidangGroup, setNewBidangGroup] = useState("I. PENYELENGGARAAN PEMERINTAHAN DESA");
  const [newKodeRekening, setNewKodeRekening] = useState("4");
  const [newUraianKegiatan, setNewUraianKegiatan] = useState("");
  const [newBesarnyaBiaya, setNewBesarnyaBiaya] = useState<number>(0);
  const [newKeterangan, setNewKeterangan] = useState("per bulan");

  useEffect(() => {
    setMounted(true);
    const initial = getRkkdPagus().PBH;
    setPaguBhprd(initial);
    setPaguInputVal(initial);

    const handleSync = () => {
      const current = getRkkdPagus().PBH;
      setPaguBhprd(current);
    };
    window.addEventListener("rkkd_pagu_updated", handleSync);
    return () => window.removeEventListener("rkkd_pagu_updated", handleSync);
  }, []);

  useEffect(() => {
    if (mounted) {
      updateRkkdPagu("PBH", paguBhprd);
    }
  }, [paguBhprd, items, mounted]);

  const handleSavePagu = () => {
    if (paguInputVal > 0) {
      setPaguBhprd(paguInputVal);
      updateRkkdPagu("PBH", paguInputVal);
    }
    setIsEditingPagu(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNewBidangGroup("I. PENYELENGGARAAN PEMERINTAHAN DESA");
    setNewKodeRekening("4");
    setNewUraianKegiatan("");
    setNewBesarnyaBiaya(0);
    setNewKeterangan("per bulan");
    setIsModalOpen(true);
  };

  const openEditModal = (item: RkkdBhprdItem) => {
    setEditingItem(item);
    setNewBidangGroup(item.bidangGroup);
    setNewKodeRekening(item.kodeRekening);
    setNewUraianKegiatan(item.uraianKegiatan);
    setNewBesarnyaBiaya(item.besarnyaBiaya);
    setNewKeterangan(item.keterangan);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus item RKKD BHPRD ini?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUraianKegiatan || !newBesarnyaBiaya) return;

    const t1 = Math.round(newBesarnyaBiaya * 0.50);
    const t2 = Math.round(newBesarnyaBiaya * 0.25);
    const t3 = newBesarnyaBiaya - t1 - t2;

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? {
        ...i,
        bidangGroup: newBidangGroup,
        kodeRekening: newKodeRekening,
        uraianKegiatan: newUraianKegiatan.toUpperCase(),
        besarnyaBiaya: Number(newBesarnyaBiaya) || 0,
        tahap1: t1,
        tahap2: t2,
        tahap3: t3,
        keterangan: newKeterangan
      } : i));
    } else {
      const newItem: RkkdBhprdItem = {
        id: `bh-${Date.now()}`,
        no: items.length + 1,
        bidangGroup: newBidangGroup,
        kodeRekening: newKodeRekening,
        uraianKegiatan: newUraianKegiatan.toUpperCase(),
        besarnyaBiaya: Number(newBesarnyaBiaya) || 0,
        tahap1: t1,
        tahap2: t2,
        tahap3: t3,
        keterangan: newKeterangan,
        sumberDana: "BHPRD"
      };
      setItems(prev => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  const totalAnggaran = items.reduce((acc, curr) => acc + curr.besarnyaBiaya, 0);
  const sisaPagu = paguBhprd - totalAnggaran;
  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

  const filteredItems = items.filter(i => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchU = i.uraianKegiatan.toLowerCase().includes(q);
      const matchB = i.bidangGroup.toLowerCase().includes(q);
      if (!matchU && !matchB) return false;
    }
    return true;
  });

  const renderBhprdDocument = (isPortal = false) => (
    <div
      id={isPortal ? "rkkd-bhprd-print-portal" : "rkkd-bhprd-print"}
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
        <div>BAGI HASIL PAJAK & RETRIBUSI DAERAH (BHPRD) TAHUN ANGGARAN 2026</div>
        <div>DESA CIMANGGU I KECAMATAN CIBUNGBULANG KABUPATEN BOGOR</div>
      </div>

      <div className="flex justify-between items-center text-[10pt] font-extrabold mb-3 bg-purple-100 p-2 border border-black">
        <div>Pagu BHPRD: Rp {formatRupiah(paguBhprd)}</div>
        <div>Total Penggunaan: Rp {formatRupiah(totalAnggaran)}</div>
        <div className={sisaPagu === 0 ? "text-purple-900" : "text-rose-900"}>Sisa: Rp {formatRupiah(sisaPagu)}</div>
      </div>

      <table className="w-full border-collapse border border-black text-[9pt] table-fixed mb-6">
        <thead>
          <tr className="bg-slate-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1.5 w-[35px]">NO</th>
            <th className="border border-black p-1.5">URAIAN KEGIATAN</th>
            <th className="border border-black p-1.5 w-[110px]">BESARNYA BIAYA (Rp)</th>
            <th className="border border-black p-1.5 w-[90px]">TAHAP 1 (50%)</th>
            <th className="border border-black p-1.5 w-[90px]">TAHAP 2 (25%)</th>
            <th className="border border-black p-1.5 w-[90px]">TAHAP 3 (25%)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className="border-b border-black h-[24px]">
              <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
              <td className="border border-black p-1 pl-2 font-medium">{item.uraianKegiatan}</td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-2">{formatRupiah(item.besarnyaBiaya)}</td>
              <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(item.tahap1)}</td>
              <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(item.tahap2)}</td>
              <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(item.tahap3)}</td>
            </tr>
          ))}

          <tr className="bg-purple-700 text-white font-black text-[10.5pt] border-b border-black">
            <td className="border border-black p-2 text-center uppercase" colSpan={2}>
              TOTAL KESELURUHAN RKKD BHPRD
            </td>
            <td className="border border-black p-2 text-right font-mono pr-2 font-black">{formatRupiah(totalAnggaran)}</td>
            <td className="border border-black p-2 text-right font-mono pr-2 font-bold">{formatRupiah(items.reduce((a,c) => a + c.tahap1, 0))}</td>
            <td className="border border-black p-2 text-right font-mono pr-2 font-bold">{formatRupiah(items.reduce((a,c) => a + c.tahap2, 0))}</td>
            <td className="border border-black p-2 text-right font-mono pr-2 font-bold">{formatRupiah(items.reduce((a,c) => a + c.tahap3, 0))}</td>
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
          #rkkd-bhprd-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #rkkd-bhprd-print-mount-root {
            display: block !important;
            visibility: visible !important;
          }

          #rkkd-bhprd-print-portal {
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

          #rkkd-bhprd-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
            box-sizing: border-box !important;
          }

          #rkkd-bhprd-print-portal table {
            display: table !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }

          #rkkd-bhprd-print-portal tr {
            display: table-row !important;
          }

          #rkkd-bhprd-print-portal td, #rkkd-bhprd-print-portal th {
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

      {/* TOP SUMMARY CARDS FOR RKKD BHPRD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {/* PAGU CARD WITH MANUAL INPUT */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-5 shadow-xl border border-purple-500/30 relative">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-100 block">Pagu RKKD BHPRD 2026</span>
            <button
              onClick={() => {
                setPaguInputVal(paguBhprd);
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
            <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(paguBhprd)}</div>
          )}

          <span className="text-[11px] text-purple-100 mt-2 block">Bagi Hasil Pajak & Retribusi Daerah (Dapat Diubah)</span>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-3xl p-5 shadow-xl border border-purple-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-100 block mb-1">Total Penggunaan BHPRD</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalAnggaran)}</div>
          <span className="text-[11px] text-purple-100 mt-2 block">3 Tahapan (50% - 25% - 25%)</span>
        </div>

        <div className={`rounded-3xl p-5 text-white shadow-xl border ${
          sisaPagu === 0 
            ? "bg-slate-900 border-slate-700" 
            : sisaPagu < 0 
              ? "bg-gradient-to-br from-rose-600 to-red-700 border-rose-500/30" 
              : "bg-gradient-to-br from-amber-600 to-orange-700 border-amber-500/30"
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">Sisa / Balance Pagu BHPRD</span>
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
                  Total rincian penggunaan (Rp {formatRupiah(totalAnggaran)}) melebihi batas pagu (Rp {formatRupiah(paguBhprd)}). Terjadi defisit sebesar <span className="font-mono font-bold text-rose-900">Rp {formatRupiah(Math.abs(sisaPagu))}</span>. Mohon sesuaikan item kegiatan atau perbarui Pagu.
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
                  Masih terdapat sisa alokasi pagu anggaran sebesar <span className="font-mono font-bold text-amber-950">Rp {formatRupiah(sisaPagu)}</span> yang belum dimasukkan ke rincian kegiatan RKKD BHPRD.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-purple-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-purple-900 text-sm">✅ ANGGARAN RKKD BHPRD BALANCE 100%!</h4>
                <p className="text-xs text-purple-800 font-medium mt-0.5">
                  Seluruh alokasi pagu anggaran (Rp {formatRupiah(paguBhprd)}) telah terserap secara presisi dan sempurna.
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
              <Table size={14} className={viewMode === "table" ? "text-purple-600" : ""} />
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
              <FileText size={14} className={viewMode === "print-preview" ? "text-purple-600" : ""} />
              <span>Preview Format Cetak (F4)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Plus size={16} />
            <span>Tambah Item BHPRD</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-600/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Printer size={16} />
            <span>Cetak Dokumen BHPRD (F4)</span>
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
                placeholder="Cari uraian kegiatan BHPRD..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-500 bg-white"
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
                  <th className="p-3.5 min-w-[200px]">Bidang / Kelompok</th>
                  <th className="p-3.5 min-w-[220px]">Uraian Kegiatan</th>
                  <th className="p-3.5 text-right min-w-[140px]">Biaya (Rp)</th>
                  <th className="p-3.5 text-right min-w-[120px]">Tahap 1 (50%)</th>
                  <th className="p-3.5 text-right min-w-[120px]">Tahap 2 (25%)</th>
                  <th className="p-3.5 text-right min-w-[120px]">Tahap 3 (25%)</th>
                  <th className="p-3.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                      Tidak ada data kegiatan RKKD BHPRD yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {item.bidangGroup}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{item.uraianKegiatan}</td>
                      <td className="p-3.5 text-right font-mono font-black text-purple-600 text-sm">
                        Rp {formatRupiah(item.besarnyaBiaya)}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-600">{formatRupiah(item.tahap1)}</td>
                      <td className="p-3.5 text-right font-mono text-slate-600">{formatRupiah(item.tahap2)}</td>
                      <td className="p-3.5 text-right font-mono text-slate-600">{formatRupiah(item.tahap3)}</td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 border border-amber-200 transition-all cursor-pointer"
                            title="Edit Item BHPRD"
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
                  <td colSpan={3} className="p-3.5 text-right uppercase tracking-wider">
                    Total Keseluruhan BHPRD:
                  </td>
                  <td className="p-3.5 text-right font-mono text-purple-300 text-sm font-black">
                    Rp {formatRupiah(totalAnggaran)}
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
          <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            --- Preview Dokumen Resmi RKKD BHPRD (Kertas F4 Cambria) ---
          </span>
          {renderBhprdDocument(false)}
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
                    <span>Edit Kegiatan RKKD BHPRD</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="text-purple-600" />
                    <span>Tambah Kegiatan RKKD BHPRD</span>
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
                <label className="block font-bold text-slate-700 mb-1">Bidang / Kelompok</label>
                <select
                  value={newBidangGroup}
                  onChange={(e) => setNewBidangGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-purple-500"
                >
                  <option value="I. PENYELENGGARAAN PEMERINTAHAN DESA">I. Penyelenggaraan Pemdes</option>
                  <option value="III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN">III. Pembinaan Kemasyarakatan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uraian Kegiatan</label>
                <input
                  type="text"
                  required
                  value={newUraianKegiatan}
                  onChange={(e) => setNewUraianKegiatan(e.target.value)}
                  placeholder="Contoh: TUNJANGAN KINERJA KEPALA DESA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Besarnya Biaya (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newBesarnyaBiaya || ""}
                    onChange={(e) => setNewBesarnyaBiaya(Number(e.target.value))}
                    placeholder="12000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keterangan / Periode</label>
                  <input
                    type="text"
                    value={newKeterangan}
                    onChange={(e) => setNewKeterangan(e.target.value)}
                    placeholder="per bulan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                <div className="flex justify-between text-xs font-bold text-purple-900">
                  <span>Tahap 1 (50%):</span>
                  <span className="font-mono">Rp {formatRupiah(Math.round(newBesarnyaBiaya * 0.5))}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-purple-900">
                  <span>Tahap 2 (25%) & Tahap 3 (25%):</span>
                  <span className="font-mono">Rp {formatRupiah(Math.round(newBesarnyaBiaya * 0.25))} / Tahap</span>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                >
                  {editingItem ? <Save size={14} /> : <Plus size={14} />}
                  <span>{editingItem ? "Simpan Perubahan" : "Simpan Ke Tabel BHPRD"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT CONTAINER */}
      <SafePrintPortal portalId="rkkd-bhprd-print-mount-root">
        {renderBhprdDocument(true)}
      </SafePrintPortal>
    </div>
  );
}
