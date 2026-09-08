"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, Plus, Trash2, Edit3, Save, Sparkles, Layers } from "lucide-react";

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
  const [paguBhprd, setPaguBhprd] = useState<number>(445623299);
  const [mounted, setMounted] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBidangGroup, setNewBidangGroup] = useState("I. PENYELENGGARAAN PEMERINTAHAN DESA");
  const [newKodeRekening, setNewKodeRekening] = useState("4");
  const [newUraianKegiatan, setNewUraianKegiatan] = useState("");
  const [newBesarnyaBiaya, setNewBesarnyaBiaya] = useState<number>(0);
  const [newKeterangan, setNewKeterangan] = useState("per bulan");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUraianKegiatan || !newBesarnyaBiaya) return;

    const t1 = Math.round(newBesarnyaBiaya * 0.50);
    const t2 = Math.round(newBesarnyaBiaya * 0.25);
    const t3 = newBesarnyaBiaya - t1 - t2;

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

    setItems([...items, newItem]);
    setIsAddModalOpen(false);
    setNewUraianKegiatan("");
    setNewBesarnyaBiaya(0);
  };

  const totalAnggaran = items.reduce((acc, curr) => acc + curr.besarnyaBiaya, 0);
  const totalTahap1 = Math.round(paguBhprd * 0.50); // 50%
  const totalTahap2 = Math.round(paguBhprd * 0.25); // 25%
  const totalTahap3 = Math.round(paguBhprd * 0.25); // 25%

  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

  const groupedBidang = Array.from(new Set(items.map(i => i.bidangGroup)));

  const renderBhprdDocument = (isPortal = false) => (
    <div
      id={isPortal ? "rkkd-bhprd-print-portal" : "rkkd-bhprd-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative"
      style={{
        width: "330.2mm",
        minHeight: "215.9mm",
        padding: "15mm 15mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "9.5pt",
        lineHeight: "1.3"
      }}
    >
      {/* HEADER OFFICIAL BHPRD (PERSIS GAMBAR PDF 2) */}
      <div className="text-center font-extrabold text-[12pt] mb-4 uppercase tracking-wide leading-snug">
        <div>RENCANA PENGGUNAAN BHPRD</div>
        <div>TAHUN 2026</div>
      </div>

      {/* HEADER PAGU ANGGARAN & TAHAPAN */}
      <div className="grid grid-cols-12 bg-purple-100 font-extrabold text-[9.5pt] border border-black mb-3 p-2">
        <div className="col-span-4">PAGU ANGGARAN : Rp {formatRupiah(paguBhprd)}</div>
        <div className="col-span-8 text-right font-mono">
          TAHAP I (50%): Rp {formatRupiah(totalTahap1)} | TAHAP II (25%): Rp {formatRupiah(totalTahap2)} | TAHAP III (25%): Rp {formatRupiah(totalTahap3)}
        </div>
      </div>

      {/* TABEL BHPRD OFFICIAL */}
      <table className="w-full border-collapse border border-black text-[9pt] table-fixed mb-6">
        <thead>
          <tr className="bg-purple-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1.5 w-[35px]" rowSpan={2}>NO</th>
            <th className="border border-black p-1.5 w-[140px]" rowSpan={2}>BIDANG</th>
            <th className="border border-black p-1.5 w-[65px]" rowSpan={2}>KODE REK</th>
            <th className="border border-black p-1.5 text-center" rowSpan={2}>URAIAN KEGIATAN</th>
            <th className="border border-black p-1.5 w-[110px]" rowSpan={2}>BESARNYA (Rp)</th>
            <th className="border border-black p-1 text-center" colSpan={3}>TAHAP</th>
            <th className="border border-black p-1.5 w-[110px]" rowSpan={2}>KETERANGAN</th>
          </tr>
          <tr className="bg-purple-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1 w-[90px]">I (50%)</th>
            <th className="border border-black p-1 w-[90px]">II (25%)</th>
            <th className="border border-black p-1 w-[90px]">III (25%)</th>
          </tr>
        </thead>
        <tbody>
          {groupedBidang.map((bidang) => {
            const bidangItems = items.filter(i => i.bidangGroup === bidang);
            const bidangTotal = bidangItems.reduce((acc, curr) => acc + curr.besarnyaBiaya, 0);

            return (
              <React.Fragment key={bidang}>
                {/* BIDANG HEADER ROW */}
                <tr className="bg-purple-100 font-extrabold border-b border-black">
                  <td className="border border-black p-1.5 text-center" colSpan={3}></td>
                  <td className="border border-black p-1.5 px-2 uppercase font-black">{bidang}</td>
                  <td className="border border-black p-1.5 text-right font-mono font-black">{formatRupiah(bidangTotal)}</td>
                  <td className="border border-black p-1.5" colSpan={4}></td>
                </tr>

                {/* ITEMS */}
                {bidangItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-black h-[26px]">
                    <td className="border border-black p-1 text-center font-medium">{item.no || idx + 1}</td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1 text-center font-mono font-bold">{item.kodeRekening}</td>
                    <td className="border border-black p-1 px-2 font-medium">{item.uraianKegiatan}</td>
                    <td className="border border-black p-1 text-right font-mono font-bold pr-1.5">{formatRupiah(item.besarnyaBiaya)}</td>
                    <td className="border border-black p-1 text-right font-mono pr-1.5">{item.tahap1 ? formatRupiah(item.tahap1) : "-"}</td>
                    <td className="border border-black p-1 text-right font-mono pr-1.5">{item.tahap2 ? formatRupiah(item.tahap2) : "-"}</td>
                    <td className="border border-black p-1 text-right font-mono pr-1.5">{item.tahap3 ? formatRupiah(item.tahap3) : "-"}</td>
                    <td className="border border-black p-1 text-center text-[8.5pt]">{item.keterangan}</td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}

          {/* TOTAL GRAND TOTAL RKKD BHPRD ROW */}
          <tr className="bg-purple-700 text-white font-black text-[10.5pt] border-b border-black">
            <td className="border border-black p-2 text-center uppercase" colSpan={4}>
              JUMLAH TOTAL ( I + II + III + IV )
            </td>
            <td className="border border-black p-2 text-right font-mono pr-2 font-black">{formatRupiah(totalAnggaran)}</td>
            <td className="border border-black p-2" colSpan={4}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CSS PRINT RULES FOR EXACT F4 LANDSCAPE CAMBRIA FORMAT */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #rkkd-bhprd-print-portal {
            display: none !important;
          }
        }
        @media print {
          body > *:not(#rkkd-bhprd-print-portal) {
            display: none !important;
          }

          #rkkd-bhprd-print-portal {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 330.2mm !important;
            min-height: 215.9mm !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #rkkd-bhprd-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
          }

          #rkkd-bhprd-print-portal table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #rkkd-bhprd-print-portal tr {
            display: table-row !important;
          }

          #rkkd-bhprd-print-portal td, #rkkd-bhprd-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
          }

          @page {
            size: 330.2mm 215.9mm; /* F4 Landscape */
            margin: 10mm 12mm;
          }
        }
      `}} />

      {/* TOP SUMMARY CARDS FOR RKKD BHPRD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-purple-600 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-100 block mb-1">Pagu BHPRD 2026</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(paguBhprd)}</div>
          <span className="text-[11px] text-purple-100 mt-2 block">Bagi Hasil Pajak & Retribusi Daerah</span>
        </div>

        <div className="bg-indigo-600 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 block mb-1">Total Rencana Penggunaan</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalAnggaran)}</div>
          <span className="text-[11px] text-indigo-100 mt-2 block">Penahapan 3 Tahap (50%, 25%, 25%)</span>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">Status Sinkron APBDes</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">KLOP 100%</div>
          <span className="text-[11px] text-slate-300 mt-2 block">Terintegrasi otomatis ke APBDes</span>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
            4
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Dokumen Rencana Penggunaan BHPRD 2026</h3>
            <p className="text-[11px] text-slate-500">Format Resmi Lampiran Rencana Penggunaan Bagi Hasil Pajak Daerah</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Item BHPRD</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Printer size={16} />
            <span>Cetak Rencana BHPRD (F4 Landscape)</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER ON SCREEN */}
      <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
        <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          --- Preview Dokumen Resmi Rencana Penggunaan BHPRD (Kertas F4 Cambria - Persis Gambar PDF 2) ---
        </span>

        {renderBhprdDocument(false)}
      </div>

      {/* MODAL FORM TAMBAH ITEM KEGIATAN BHPRD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-purple-600" />
                <span>Tambah Uraian Kegiatan BHPRD 2026</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <Trash2 size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bidang / Kelompok</label>
                <select
                  value={newBidangGroup}
                  onChange={(e) => setNewBidangGroup(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-purple-500"
                >
                  <option value="I. PENYELENGGARAAN PEMERINTAHAN DESA">I. PENYELENGGARAAN PEMERINTAHAN DESA</option>
                  <option value="III. JUMLAH BIDANG PEMBINAAN KEMASYARAKATAN">III. BIDANG PEMBINAAN KEMASYARAKATAN</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Rekening</label>
                  <input
                    type="text"
                    value={newKodeRekening}
                    onChange={(e) => setNewKodeRekening(e.target.value)}
                    placeholder="4"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Keterangan Satuan</label>
                  <input
                    type="text"
                    value={newKeterangan}
                    onChange={(e) => setNewKeterangan(e.target.value)}
                    placeholder="per bulan / PER KEGIATAN"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Uraian Kegiatan BHPRD</label>
                <input
                  type="text"
                  required
                  value={newUraianKegiatan}
                  onChange={(e) => setNewUraianKegiatan(e.target.value)}
                  placeholder="Contoh: HONOR PETUGAS PUSKESOS / KALENDER"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Besarnya Biaya Anggaran (Rp)</label>
                <input
                  type="number"
                  required
                  value={newBesarnyaBiaya || ""}
                  onChange={(e) => setNewBesarnyaBiaya(Number(e.target.value))}
                  placeholder="18000000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold focus:outline-none focus:border-purple-500"
                />
                <span className="text-[11px] text-purple-700 mt-1 block">
                  *Otomatis terbagi 3 Tahap: 50% Tahap I, 25% Tahap II, 25% Tahap III
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
                >
                  <Plus size={14} /> Simpan Ke BHPRD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REACT PORTAL DIRECT TO BODY FOR 100% RELIABLE PRINTING */}
      {mounted && createPortal(
        renderBhprdDocument(true),
        document.body
      )}
    </div>
  );
}
