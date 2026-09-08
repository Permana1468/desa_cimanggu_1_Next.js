"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, Plus, Trash2, Edit3, Save, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

export interface RkkdAddItem {
  id: string;
  bidangNo: string;
  bidangName: string;
  subBidangName: string;
  kategoriGroup: string; // e.g. "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa"
  namaKegiatan: string;
  volCount: number;
  volMultiplier: number;
  satuanBiaya: number;
  sumberDana: "ADD";
}

const defaultAddList: RkkdAddItem[] = [
  // A. Penghasilan Tetap
  { id: "add-1", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "1. Kepala Desa", volCount: 1, volMultiplier: 12, satuanBiaya: 4750000, sumberDana: "ADD" },
  { id: "add-2", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "2. Sekretaris Desa", volCount: 1, volMultiplier: 12, satuanBiaya: 3750000, sumberDana: "ADD" },
  { id: "add-3", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "3. Kasi Pelayanan", volCount: 1, volMultiplier: 12, satuanBiaya: 3000000, sumberDana: "ADD" },
  { id: "add-4", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "4. Kasi Pemerintahan", volCount: 1, volMultiplier: 12, satuanBiaya: 3000000, sumberDana: "ADD" },
  { id: "add-5", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "5. Kasi Kesejahteraan", volCount: 1, volMultiplier: 12, satuanBiaya: 3000000, sumberDana: "ADD" },
  { id: "add-6", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "6. Kaur Perencanaan", volCount: 1, volMultiplier: 12, satuanBiaya: 2850000, sumberDana: "ADD" },
  { id: "add-7", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "7. Kaur Keuangan", volCount: 1, volMultiplier: 12, satuanBiaya: 2850000, sumberDana: "ADD" },
  { id: "add-8", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "8. Kaur TU & Umum", volCount: 1, volMultiplier: 12, satuanBiaya: 2850000, sumberDana: "ADD" },
  { id: "add-9", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "9. Kepala Dusun I", volCount: 1, volMultiplier: 12, satuanBiaya: 2025000, sumberDana: "ADD" },
  { id: "add-10", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "10. Kepala Dusun II", volCount: 1, volMultiplier: 12, satuanBiaya: 2025000, sumberDana: "ADD" },
  { id: "add-11", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "11. Kepala Dusun III", volCount: 1, volMultiplier: 12, satuanBiaya: 2025000, sumberDana: "ADD" },
  { id: "add-12", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "12. Kepala Dusun IV", volCount: 1, volMultiplier: 12, satuanBiaya: 2025000, sumberDana: "ADD" },

  // B. Operasional Pemdes
  { id: "add-13", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "B. Penyediaan Operasional Pemerintah Desa", namaKegiatan: "1. Operasional Pemdes", volCount: 1, volMultiplier: 12, satuanBiaya: 500000, sumberDana: "ADD" },

  // C. Penyediaan Tunjangan BPD
  { id: "add-14", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "C. Penyediaan Tunjangan BPD", namaKegiatan: "1. Ketua BPD", volCount: 1, volMultiplier: 12, satuanBiaya: 1050000, sumberDana: "ADD" },
  { id: "add-15", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "C. Penyediaan Tunjangan BPD", namaKegiatan: "2. Wakil Ketua BPD", volCount: 1, volMultiplier: 12, satuanBiaya: 950000, sumberDana: "ADD" },
  { id: "add-16", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "C. Penyediaan Tunjangan BPD", namaKegiatan: "3. Sekretaris BPD", volCount: 1, volMultiplier: 12, satuanBiaya: 900000, sumberDana: "ADD" },
  { id: "add-17", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "C. Penyediaan Tunjangan BPD", namaKegiatan: "4. Anggota BPD", volCount: 6, volMultiplier: 12, satuanBiaya: 800000, sumberDana: "ADD" },

  // D. Operasional BPD
  { id: "add-18", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "D. Penyediaan Operasional BPD", namaKegiatan: "1. Operasional BPD", volCount: 1, volMultiplier: 12, satuanBiaya: 1500000, sumberDana: "ADD" },

  // E. Insentif RT/RW
  { id: "add-19", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "E. Penyediaan Insentif RT RW", namaKegiatan: "1. RT", volCount: 32, volMultiplier: 12, satuanBiaya: 600000, sumberDana: "ADD" },
  { id: "add-20", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "E. Penyediaan Insentif RT RW", namaKegiatan: "2. RW", volCount: 9, volMultiplier: 12, satuanBiaya: 600000, sumberDana: "ADD" },

  // F. Insentif Posyandu
  { id: "add-21", bidangNo: "2", bidangName: "PELAKSANAAN PEMBANGUNAN DESA", subBidangName: "KESEHATAN", kategoriGroup: "F. Insentif Posyandu (ADD Khusus)", namaKegiatan: "1. Operasional Posyandu", volCount: 7, volMultiplier: 1, satuanBiaya: 3000000, sumberDana: "ADD" },

  // H. Insentif Guru Ngaji
  { id: "add-22", bidangNo: "2", bidangName: "PELAKSANAAN PEMBANGUNAN DESA", subBidangName: "KEBUDAYAAN DAN KEAGAMAAN", kategoriGroup: "H. Insentif Guru Ngaji", namaKegiatan: "1. Insentif Guru Ngaji", volCount: 25, volMultiplier: 12, satuanBiaya: 200000, sumberDana: "ADD" },

  // G. Insentif Linmas
  { id: "add-23", bidangNo: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangName: "KETENTRAMAN, KETERTIBAN UMUM DAN PERLINDUNGAN MASYARAKAT", kategoriGroup: "G. Insentif Linmas Desa", namaKegiatan: "1. Insentif Linmas Desa", volCount: 10, volMultiplier: 12, satuanBiaya: 300000, sumberDana: "ADD" }
];

export function RkkdAddSection() {
  const [items, setItems] = useState<RkkdAddItem[]>(defaultAddList);
  const [paguAdd, setPaguAdd] = useState<number>(916400000);
  const [mounted, setMounted] = useState(false);

  // Modal & Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKategori, setNewKategori] = useState("A. Penghasilan Tetap Kepala Desa dan Perangkat Desa");
  const [newNamaKegiatan, setNewNamaKegiatan] = useState("");
  const [newVolCount, setNewVolCount] = useState<number>(1);
  const [newVolMultiplier, setNewVolMultiplier] = useState<number>(12);
  const [newSatuanBiaya, setNewSatuanBiaya] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNamaKegiatan || !newSatuanBiaya) return;

    let bidangNo = "1";
    let bidangName = "PENYELENGGARAAN PEMERINTAHAN DESA";
    let subBidangName = "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA";

    if (newKategori.includes("Posyandu") || newKategori.includes("Guru Ngaji")) {
      bidangNo = "2";
      bidangName = "PELAKSANAAN PEMBANGUNAN DESA";
      subBidangName = newKategori.includes("Posyandu") ? "KESEHATAN" : "KEBUDAYAAN DAN KEAGAMAAN";
    } else if (newKategori.includes("Linmas")) {
      bidangNo = "3";
      bidangName = "BIDANG PEMBINAAN KEMASYARAKATAN";
      subBidangName = "KETENTRAMAN, KETERTIBAN UMUM DAN PERLINDUNGAN MASYARAKAT";
    }

    const newItem: RkkdAddItem = {
      id: `add-${Date.now()}`,
      bidangNo,
      bidangName,
      subBidangName,
      kategoriGroup: newKategori,
      namaKegiatan: newNamaKegiatan,
      volCount: Number(newVolCount) || 1,
      volMultiplier: Number(newVolMultiplier) || 12,
      satuanBiaya: Number(newSatuanBiaya) || 0,
      sumberDana: "ADD"
    };

    setItems([...items, newItem]);
    setIsAddModalOpen(false);
    setNewNamaKegiatan("");
    setNewSatuanBiaya(0);
  };

  const totalAnggaran = items.reduce((acc, curr) => acc + (curr.volCount * curr.volMultiplier * curr.satuanBiaya), 0);
  const sisaPagu = paguAdd - totalAnggaran;

  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

  // Group items by Category
  const groupedCategories = Array.from(new Set(items.map(i => i.kategoriGroup)));

  const renderAddDocument = (isPortal = false) => (
    <div
      id={isPortal ? "rkkd-add-print-portal" : "rkkd-add-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative"
      style={{
        width: "330.2mm",
        minHeight: "215.9mm",
        padding: "15mm 15mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "10pt",
        lineHeight: "1.3"
      }}
    >
      {/* HEADER OFFICIAL RKKD ADD (PERSIS GAMBAR PDF 3) */}
      <div className="text-center font-extrabold text-[12pt] mb-4 uppercase tracking-wide leading-snug">
        <div>RENCANA KEGIATAN KERJA DESA (RKKD)</div>
        <div>PENGGUNAAN DANA ALOKASI DANA DESA TAHUN ANGGARAN 2026-INDIKATIF</div>
        <div>DESA CIMANGGU I KECAMATAN CIBUNGBULANG KABUPATEN BOGOR</div>
      </div>

      {/* PAGU ANGGARAN ROW */}
      <div className="flex justify-between items-center text-[10pt] font-extrabold mb-3 bg-yellow-100 p-2 border border-black">
        <div>Pagu ADD: Rp {formatRupiah(paguAdd)}</div>
        <div>Total Penggunaan: Rp {formatRupiah(totalAnggaran)}</div>
        <div className={sisaPagu === 0 ? "text-emerald-800" : "text-rose-800"}>Sisa: Rp {formatRupiah(sisaPagu)}</div>
      </div>

      {/* TABEL RKKD ADD OFFICIAL */}
      <table className="w-full border-collapse border border-black text-[9pt] table-fixed mb-6">
        <thead>
          <tr className="bg-slate-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1.5 w-[35px]" rowSpan={2}>NO</th>
            <th className="border border-black p-1.5 w-[140px]" rowSpan={2}>BIDANG</th>
            <th className="border border-black p-1.5 w-[140px]" rowSpan={2}>SUB BIDANG</th>
            <th className="border border-black p-1.5 text-center" rowSpan={2}>JENIS KEGIATAN</th>
            <th className="border border-black p-1 text-center" colSpan={2}>BIAYA</th>
            <th className="border border-black p-1 text-center" colSpan={2}>SUMBER DANA ADD</th>
            <th className="border border-black p-1.5 w-[120px]" rowSpan={2}>JUMLAH (Rp)</th>
          </tr>
          <tr className="bg-slate-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1 w-[80px]">VOLUME</th>
            <th className="border border-black p-1 w-[90px]">SATUAN</th>
            <th className="border border-black p-1 w-[100px]">TAHAP I (50%)</th>
            <th className="border border-black p-1 w-[100px]">TAHAP II (50%)</th>
          </tr>
        </thead>
        <tbody>
          {groupedCategories.map((cat, catIdx) => {
            const catItems = items.filter(i => i.kategoriGroup === cat);
            const catTotal = catItems.reduce((acc, curr) => acc + (curr.volCount * curr.volMultiplier * curr.satuanBiaya), 0);
            const firstItem = catItems[0];

            return (
              <React.Fragment key={cat}>
                {/* CATEGORY HEADER ROW */}
                <tr className="bg-emerald-50 font-bold border-b border-black">
                  <td className="border border-black p-1 text-center font-bold">{firstItem.bidangNo}</td>
                  <td className="border border-black p-1 text-[8.5pt] uppercase font-bold">{firstItem.bidangName}</td>
                  <td className="border border-black p-1 text-[8.5pt] font-semibold">{firstItem.subBidangName}</td>
                  <td className="border border-black p-1 font-extrabold text-slate-900" colSpan={5}>
                    {cat}
                  </td>
                  <td className="border border-black p-1 text-right font-mono font-bold">{formatRupiah(catTotal)}</td>
                </tr>

                {/* ITEMS UNDER CATEGORY */}
                {catItems.map((item) => {
                  const itemTotal = item.volCount * item.volMultiplier * item.satuanBiaya;
                  const tahap = itemTotal / 2;

                  return (
                    <tr key={item.id} className="border-b border-black h-[28px]">
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 pl-4 font-medium">{item.namaKegiatan}</td>
                      <td className="border border-black p-1 text-center font-mono">
                        {item.volCount > 1 ? `${item.volCount} x ` : ""}{item.volMultiplier}
                      </td>
                      <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(item.satuanBiaya)}</td>
                      <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(tahap)}</td>
                      <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(tahap)}</td>
                      <td className="border border-black p-1 text-right font-mono font-bold pr-2">{formatRupiah(itemTotal)}</td>
                    </tr>
                  );
                })}

                {/* CATEGORY TOTAL ROW */}
                <tr className="bg-amber-100 font-extrabold border-b border-black text-[9.5pt]">
                  <td className="border border-black p-1 text-right font-bold" colSpan={8}>
                    Jumlah {cat.split(".")[0] || ""} :
                  </td>
                  <td className="border border-black p-1 text-right font-mono text-emerald-950 font-black">{formatRupiah(catTotal)}</td>
                </tr>
              </React.Fragment>
            );
          })}

          {/* TOTAL GRAND TOTAL RKKD ADD ROW */}
          <tr className="bg-emerald-600 text-white font-black text-[11pt] border-b border-black">
            <td className="border border-black p-2 text-center uppercase" colSpan={8}>
              TOTAL KESELURUHAN RKKD ADD
            </td>
            <td className="border border-black p-2 text-right font-mono pr-2 font-black">{formatRupiah(totalAnggaran)}</td>
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
          #rkkd-add-print-portal {
            display: none !important;
          }
        }
        @media print {
          body > *:not(#rkkd-add-print-portal) {
            display: none !important;
          }

          #rkkd-add-print-portal {
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

          #rkkd-add-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
          }

          #rkkd-add-print-portal table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #rkkd-add-print-portal tr {
            display: table-row !important;
          }

          #rkkd-add-print-portal td, #rkkd-add-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
          }

          @page {
            size: 330.2mm 215.9mm; /* F4 Landscape */
            margin: 10mm 12mm;
          }
        }
      `}} />

      {/* TOP SUMMARY CARDS FOR RKKD ADD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-blue-600 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-100 block mb-1">Pagu RKKD ADD 2026</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(paguAdd)}</div>
          <span className="text-[11px] text-blue-100 mt-2 block">Alokasi Dana Desa Kabupaten</span>
        </div>

        <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block mb-1">Total Penggunaan RKKD ADD</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalAnggaran)}</div>
          <span className="text-[11px] text-emerald-100 mt-2 block">2 Tahapan (Tahap I 50% & Tahap II 50%)</span>
        </div>

        <div className={`rounded-3xl p-5 text-white shadow-xl ${sisaPagu === 0 ? "bg-slate-900" : "bg-rose-600"}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">Sisa / Balance Pagu ADD</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(sisaPagu)}</div>
          <span className="text-[11px] text-slate-300 mt-2 block">{sisaPagu === 0 ? "Klop Balance 100%!" : "Ada Selisih Pagu ADD"}</span>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
            2
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Dokumen RKKD ADD Indikatif 2026</h3>
            <p className="text-[11px] text-slate-500">Format Resmi Lampiran Rencana Kegiatan Kerja Desa bersumber ADD</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Item ADD</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Printer size={16} />
            <span>Cetak Dokumen RKKD ADD (F4 Landscape)</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER ON SCREEN */}
      <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
        <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          --- Preview Dokumen Resmi RKKD ADD (Kertas F4 Cambria - Persis Gambar PDF 3) ---
        </span>

        {renderAddDocument(false)}
      </div>
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <span>Tambah Rincian Kegiatan RKKD ADD</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <Trash2 size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Kategori Group RKKD ADD</label>
                <select
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="A. Penghasilan Tetap Kepala Desa dan Perangkat Desa">A. Penghasilan Tetap Kades & Perangkat</option>
                  <option value="B. Penyediaan Operasional Pemerintah Desa">B. Penyediaan Operasional Pemdes</option>
                  <option value="C. Penyediaan Tunjangan BPD">C. Tunjangan BPD</option>
                  <option value="D. Penyediaan Operasional BPD">D. Operasional BPD</option>
                  <option value="E. Penyediaan Insentif RT RW">E. Insentif RT & RW</option>
                  <option value="F. Insentif Posyandu (ADD Khusus)">F. Insentif Posyandu (ADD Khusus)</option>
                  <option value="H. Insentif Guru Ngaji">H. Insentif Guru Ngaji</option>
                  <option value="G. Insentif Linmas Desa">G. Insentif Linmas Desa</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan / Uraian</label>
                <input
                  type="text"
                  required
                  value={newNamaKegiatan}
                  onChange={(e) => setNewNamaKegiatan(e.target.value)}
                  placeholder="Contoh: Insentif Kader Kesehatan / Staf Tambahan"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah (Orang/Unit)</label>
                  <input
                    type="number"
                    value={newVolCount}
                    onChange={(e) => setNewVolCount(Number(e.target.value))}
                    placeholder="1"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pengali (Bulan/Pkt)</label>
                  <input
                    type="number"
                    value={newVolMultiplier}
                    onChange={(e) => setNewVolMultiplier(Number(e.target.value))}
                    placeholder="12"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newSatuanBiaya || ""}
                    onChange={(e) => setNewSatuanBiaya(Number(e.target.value))}
                    placeholder="500000"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <Plus size={14} /> Simpan Ke Tabel ADD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REACT PORTAL DIRECT TO BODY FOR 100% RELIABLE PRINTING */}
      {mounted && createPortal(
        renderAddDocument(true),
        document.body
      )}
    </div>
  );
}
