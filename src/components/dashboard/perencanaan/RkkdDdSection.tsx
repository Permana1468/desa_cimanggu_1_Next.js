"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, Plus, Trash2, Edit3, Save, Sparkles, Building2 } from "lucide-react";

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
  const [paguDd, setPaguDd] = useState<number>(1530723000);
  const [mounted, setMounted] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPrasarana, setNewPrasarana] = useState("");
  const [newVol, setNewVol] = useState("");
  const [newLokasi, setNewLokasi] = useState("RT. 01/01");
  const [newAnggaran, setNewAnggaran] = useState<number>(0);
  const [newKet, setNewKet] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrasarana || !newAnggaran) return;

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

    setItems([...items, newItem]);
    setIsAddModalOpen(false);
    setNewPrasarana("");
    setNewVol("");
    setNewAnggaran(0);
  };

  const totalAnggaran = items.reduce((acc, curr) => acc + curr.anggaran, 0);
  const tahap1 = Math.round(totalAnggaran * 0.4); // 40% Tahap 1 Penyerapan DD

  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

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
      {/* HEADER OFFICIAL LAMPIRAN APBDES DD (PERSIS GAMBAR PDF 1) */}
      <div className="flex justify-end text-[9pt] font-semibold mb-4 text-right uppercase">
        <div>
          <div>Lampiran APBDes</div>
          <div>Tahun Anggaran 2026</div>
          <div>Desa Cimanggu I</div>
          <div>Kecamatan Cibungbulang</div>
        </div>
      </div>

      {/* HEADER BAR PAGU */}
      <div className="grid grid-cols-12 bg-amber-400 font-extrabold text-[10pt] border border-black mb-1 p-1">
        <div className="col-span-4">PAGU: {formatRupiah(paguDd)}</div>
        <div className="col-span-4 text-center">TOTAL: {formatRupiah(totalAnggaran)}</div>
        <div className="col-span-4 text-right">DD APBN</div>
      </div>

      {/* TABEL RKKD DANA DESA OFFICIAL */}
      <table className="w-full border-collapse border border-black text-[9pt] table-fixed mb-6">
        <thead>
          <tr className="bg-slate-300 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1 w-[30px]">NO</th>
            <th className="border border-black p-1 text-center">PRASARANA</th>
            <th className="border border-black p-1 w-[140px]">VOL</th>
            <th className="border border-black p-1 w-[110px]">LOKASI</th>
            <th className="border border-black p-1 w-[110px]">ANGGARAN</th>
            <th className="border border-black p-1 w-[50px]">SUMBER DANA</th>
            <th className="border border-black p-1 w-[45px]">KET</th>
          </tr>
        </thead>
        <tbody>
          {/* TAHAP I HEADER ROW */}
          <tr className="bg-amber-200 font-bold border-b border-black">
            <td className="border border-black p-1 text-center">I</td>
            <td className="border border-black p-1 font-extrabold" colSpan={3}>TAHAP I (40%)</td>
            <td className="border border-black p-1 text-right font-mono font-black">{formatRupiah(tahap1)}</td>
            <td className="border border-black p-1 text-center" colSpan={2}></td>
          </tr>

          {/* ITEM LIST */}
          {items.map((item, idx) => (
            <tr key={item.id} className={`border-b border-black h-[26px] ${item.prasarana.includes("BUMDES") ? "bg-emerald-100 font-bold" : ""}`}>
              <td className="border border-black p-1 text-center font-medium">{item.no || idx + 1}</td>
              <td className="border border-black p-1 font-semibold px-1.5">{item.prasarana}</td>
              <td className="border border-black p-1 text-center font-mono text-[8.5pt]">{item.vol}</td>
              <td className="border border-black p-1 text-center font-medium">{item.lokasi}</td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-1.5">{formatRupiah(item.anggaran)}</td>
              <td className="border border-black p-1 text-center font-bold">DD</td>
              <td className="border border-black p-1 text-center">{item.ket || ""}</td>
            </tr>
          ))}

          {/* JUMLAH TOTAL ROW */}
          <tr className="bg-slate-300 font-black border-b border-black text-[10pt]">
            <td className="border border-black p-1.5 text-center" colSpan={4}>JUMLAH TOTAL</td>
            <td className="border border-black p-1.5 text-right font-mono font-black pr-1.5">{formatRupiah(totalAnggaran)}</td>
            <td className="border border-black p-1.5" colSpan={2}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CSS PRINT RULES FOR EXACT F4 PORTRAIT CAMBRIA FORMAT */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #rkkd-dd-print-portal {
            display: none !important;
          }
        }
        @media print {
          body > *:not(#rkkd-dd-print-portal) {
            display: none !important;
          }

          #rkkd-dd-print-portal {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 215.9mm !important;
            min-height: 330.2mm !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #rkkd-dd-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
          }

          #rkkd-dd-print-portal table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #rkkd-dd-print-portal tr {
            display: table-row !important;
          }

          #rkkd-dd-print-portal td, #rkkd-dd-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
          }

          @page {
            size: 215.9mm 330.2mm; /* F4 Portrait */
            margin: 10mm 12mm;
          }
        }
      `}} />

      {/* TOP SUMMARY CARDS FOR RKKD DD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block mb-1">Pagu Dana Desa (DD APBN)</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(paguDd)}</div>
          <span className="text-[11px] text-emerald-100 mt-2 block">Transfer APBN Pusat 2026</span>
        </div>

        <div className="bg-teal-600 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-100 block mb-1">Total Penggunaan RKKD DD</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalAnggaran)}</div>
          <span className="text-[11px] text-teal-100 mt-2 block">Infrastruktur & Non-Infrastruktur</span>
        </div>

        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">Pencairan Tahap I (40%)</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(tahap1)}</div>
          <span className="text-[11px] text-slate-300 mt-2 block">Klop Balance 100% dengan APBDes</span>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
            3
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Dokumen RKKD Dana Desa (DD) 2026</h3>
            <p className="text-[11px] text-slate-500">Format Resmi Lampiran APBDes Dana Desa APBN Pusat</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Item DD</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Printer size={16} />
            <span>Cetak Dokumen RKKD DD (F4 Portrait)</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER ON SCREEN */}
      <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
        <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          --- Preview Dokumen Resmi RKKD DD (Kertas F4 Cambria - Persis Gambar PDF 1) ---
        </span>

        {renderDdDocument(false)}
      </div>

      {/* MODAL FORM TAMBAH ITEM KEGIATAN RKKD DD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                <span>Tambah Kegiatan RKKD Dana Desa (DD)</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <Trash2 size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Prasarana / Uraian Kegiatan</label>
                <input
                  type="text"
                  required
                  value={newPrasarana}
                  onChange={(e) => setNewPrasarana(e.target.value)}
                  placeholder="Contoh: JALING DAN PELENGKAP (TPT) / STUNTING"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rincian Volume</label>
                  <input
                    type="text"
                    value={newVol}
                    onChange={(e) => setNewVol(e.target.value)}
                    placeholder="Contoh: 173 X 1 X 0,05 M"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi RT/RW</label>
                  <input
                    type="text"
                    value={newLokasi}
                    onChange={(e) => setNewLokasi(e.target.value)}
                    placeholder="Contoh: RT. 01/05"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Anggaran Biaya (Rp)</label>
                <input
                  type="number"
                  required
                  value={newAnggaran || ""}
                  onChange={(e) => setNewAnggaran(Number(e.target.value))}
                  placeholder="100000000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold focus:outline-none focus:border-emerald-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Plus size={14} /> Simpan Ke Tabel DD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REACT PORTAL DIRECT TO BODY FOR 100% RELIABLE PRINTING */}
      {mounted && createPortal(
        renderDdDocument(true),
        document.body
      )}
    </div>
  );
}
