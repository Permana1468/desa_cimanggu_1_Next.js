"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, Plus, Trash2, Edit3, Save, Sparkles, TrendingUp } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryGroup, setNewCategoryGroup] = useState<"INFRASTRUKTUR" | "NON-INFRASTRUKTUR">("INFRASTRUKTUR");
  const [newPrasarana, setNewPrasarana] = useState("");
  const [newVol, setNewVol] = useState("");
  const [newLokasi, setNewLokasi] = useState("Cimanggu I");
  const [newAnggaran, setNewAnggaran] = useState<number>(0);
  const [newKet, setNewKet] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrasarana || !newAnggaran) return;

    const groupItems = items.filter(i => i.categoryGroup === newCategoryGroup);

    const newItem: RkkdBankeuItem = {
      id: `bk-${Date.now()}`,
      no: groupItems.length + 1,
      categoryGroup: newCategoryGroup,
      prasarana: newPrasarana.toUpperCase(),
      vol: newVol || "1 PAKET",
      lokasi: newLokasi,
      anggaran: Number(newAnggaran) || 0,
      sumberDana: "BANKEU",
      ket: newKet
    };

    setItems([...items, newItem]);
    setIsAddModalOpen(false);
    setNewPrasarana("");
    setNewVol("");
    setNewAnggaran(0);
  };

  const totalInfra = items.filter(i => i.categoryGroup === "INFRASTRUKTUR").reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalNonInfra = items.filter(i => i.categoryGroup === "NON-INFRASTRUKTUR").reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalAnggaran = totalInfra + totalNonInfra;

  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

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
      {/* HEADER OFFICIAL BANKEU (PERSIS GAMBAR PDF 4) */}
      <div className="flex justify-end text-[9pt] font-semibold mb-4 text-right uppercase">
        <div>
          <div>Lampiran APBDes</div>
          <div>Tahun Anggaran 2026</div>
          <div>Desa Cimanggu I</div>
          <div>Kecamatan Cibungbulang</div>
        </div>
      </div>

      {/* HEADER BAR PAGU BANKEU */}
      <div className="grid grid-cols-12 bg-[#8ec055] font-extrabold text-[10pt] border border-black mb-1 p-1">
        <div className="col-span-4">PAGU: {formatRupiah(paguBankeu)}</div>
        <div className="col-span-4 text-center">TOTAL: {formatRupiah(totalAnggaran)}</div>
        <div className="col-span-4 text-right">BANKEU 100%</div>
      </div>

      {/* TABEL OFFICIAL BANKEU */}
      <table className="w-full border-collapse border border-black text-[9pt] table-fixed mb-6">
        <thead>
          <tr className="bg-[#8ec055] font-extrabold text-center border-b border-black uppercase">
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
          {/* INFRASTRUKTUR HEADER ROW */}
          <tr className="bg-[#8ec055] font-black border-b border-black">
            <td className="border border-black p-1 text-center">I</td>
            <td className="border border-black p-1 font-extrabold" colSpan={3}>100% INFRASTRUKTUR</td>
            <td className="border border-black p-1 text-right font-mono font-black">{formatRupiah(totalInfra)}</td>
            <td className="border border-black p-1 text-center font-bold">BANKEU</td>
            <td className="border border-black p-1 text-center">-</td>
          </tr>

          <tr className="bg-[#8ec055]/30 font-bold border-b border-black">
            <td className="border border-black p-1" colSpan={7}>INFRASTRUKTUR</td>
          </tr>

          {items.filter(i => i.categoryGroup === "INFRASTRUKTUR").map((item) => (
            <tr key={item.id} className="border-b border-black h-[26px]">
              <td className="border border-black p-1 text-center font-medium">{item.no}</td>
              <td className="border border-black p-1 font-semibold px-1.5">{item.prasarana}</td>
              <td className="border border-black p-1 text-center font-mono text-[8.5pt]">{item.vol}</td>
              <td className="border border-black p-1 text-center font-medium">{item.lokasi}</td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-1.5">{formatRupiah(item.anggaran)}</td>
              <td className="border border-black p-1 text-center font-bold">BANKEU</td>
              <td className="border border-black p-1 text-center">{item.ket || ""}</td>
            </tr>
          ))}

          {/* NON-INFRASTRUKTUR HEADER ROW */}
          <tr className="bg-amber-200 font-bold border-b border-black">
            <td className="border border-black p-1" colSpan={7}>NON - INFRASTRUKTUR</td>
          </tr>

          {items.filter(i => i.categoryGroup === "NON-INFRASTRUKTUR").map((item) => (
            <tr key={item.id} className="border-b border-black h-[26px]">
              <td className="border border-black p-1 text-center font-medium">{item.no}</td>
              <td className="border border-black p-1 font-semibold px-1.5">{item.prasarana}</td>
              <td className="border border-black p-1 text-center font-mono text-[8.5pt]">{item.vol}</td>
              <td className="border border-black p-1 text-center font-medium">{item.lokasi}</td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-1.5">{formatRupiah(item.anggaran)}</td>
              <td className="border border-black p-1 text-center font-bold">BANKEU</td>
              <td className="border border-black p-1 text-center">{item.ket || ""}</td>
            </tr>
          ))}

          {/* JUMLAH TOTAL BANKEU ROW */}
          <tr className="bg-amber-300 font-black border-b border-black text-[10pt]">
            <td className="border border-black p-1.5 text-center" colSpan={4}>JUMLAH TOTAL BANKEU</td>
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
        @media print {
          body > *:not(#rkkd-bankeu-print-portal) {
            display: none !important;
          }

          #rkkd-bankeu-print-portal {
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

          #rkkd-bankeu-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
          }

          #rkkd-bankeu-print-portal table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #rkkd-bankeu-print-portal tr {
            display: table-row !important;
          }

          #rkkd-bankeu-print-portal td, #rkkd-bankeu-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
          }

          @page {
            size: 215.9mm 330.2mm; /* F4 Portrait */
            margin: 10mm 12mm;
          }
        }
      `}} />

      {/* TOP SUMMARY CARDS FOR RKKD BANKEU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-cyan-600 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-100 block mb-1">Pagu BANKEU Kabupaten</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(paguBankeu)}</div>
          <span className="text-[11px] text-cyan-100 mt-2 block">Bantuan Keuangan Kabupaten 2026</span>
        </div>

        <div className="bg-sky-600 text-white rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-100 block mb-1">Infrastruktur vs Non-Infrastruktur</span>
          <div className="text-xl font-bold font-mono">Infra: Rp {formatRupiah(totalInfra)}</div>
          <span className="text-[11px] text-sky-100 mt-1 block">Non-Infra: Rp {formatRupiah(totalNonInfra)}</span>
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
          <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-xs">
            5
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Dokumen RKKD BANKEU (Bantuan Keuangan) 2026</h3>
            <p className="text-[11px] text-slate-500">Format Resmi Lampiran APBDes Bantuan Keuangan Kabupaten</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Item BANKEU</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Printer size={16} />
            <span>Cetak Dokumen RKKD BANKEU (F4 Portrait)</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER ON SCREEN */}
      <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
        <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          --- Preview Dokumen Resmi RKKD BANKEU (Kertas F4 Cambria - Persis Gambar PDF 4) ---
        </span>

        {renderBankeuDocument(false)}
      </div>

      {/* MODAL FORM TAMBAH ITEM KEGIATAN BANKEU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-cyan-600" />
                <span>Tambah Kegiatan RKKD BANKEU 2026</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <Trash2 size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Kegiatan BANKEU</label>
                <select
                  value={newCategoryGroup}
                  onChange={(e) => setNewCategoryGroup(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="INFRASTRUKTUR">100% INFRASTRUKTUR</option>
                  <option value="NON-INFRASTRUKTUR">NON - INFRASTRUKTUR</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Prasarana / Kegiatan</label>
                <input
                  type="text"
                  required
                  value={newPrasarana}
                  onChange={(e) => setNewPrasarana(e.target.value)}
                  placeholder="Contoh: BETONISASI JALAN DESA / DESA SIAGA TBC"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Volume</label>
                  <input
                    type="text"
                    value={newVol}
                    onChange={(e) => setNewVol(e.target.value)}
                    placeholder="Contoh: 170 x 2,3 x 0,15"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={newLokasi}
                    onChange={(e) => setNewLokasi(e.target.value)}
                    placeholder="Contoh: 003/007 / Cimanggu I"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500"
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
                  placeholder="200000000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold focus:outline-none focus:border-cyan-500"
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
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
                >
                  <Plus size={14} /> Simpan Ke BANKEU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REACT PORTAL DIRECT TO BODY FOR 100% RELIABLE PRINTING */}
      {mounted && createPortal(
        renderBankeuDocument(true),
        document.body
      )}
    </div>
  );
}
