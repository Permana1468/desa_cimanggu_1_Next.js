"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Printer, Plus, Trash2, Edit3, Check, RefreshCw, Sparkles, X, FileSpreadsheet } from "lucide-react";
import { UndanganMuslingRwData } from "./UndanganMuslingRw";

export interface UsulanItem {
  id: string;
  jenisKegiatan: string;
  volume: string;
  sifatKegiatan: "BARU" | "LAMA" | "REHAB";
  besarnyaBiaya: number;
  keterangan: string;
}

export interface DraftUsulanRwData {
  kpName: string; // e.g. "Ciaruteun"
  rtNo: string; // e.g. "004"
  rwNo: string; // e.g. "002"
  tanggalUsulan: string; // e.g. "16 Agustus 2026"
  tahunUsulan: string; // e.g. "2026"
  namaKetuaRt: string; // e.g. "M. HARIS"
  namaKetuaRw: string; // e.g. "SAEPULOH"
}

interface DraftUsulanRwProps {
  undanganData: UndanganMuslingRwData;
  onBack?: () => void;
}

const defaultUsulanList: UsulanItem[] = [
  {
    id: "usulan-1",
    jenisKegiatan: "Pengaspalan Jalan Lingkungan Kp. Ciaruteun RT 004 / RW 002",
    volume: "400 Meter",
    sifatKegiatan: "BARU",
    besarnyaBiaya: 120000000,
    keterangan: "Prioritas 1 RW 002"
  },
  {
    id: "usulan-2",
    jenisKegiatan: "Rehabilitasi Drainase & Saluran Air Posyandu Mawar",
    volume: "150 Meter",
    sifatKegiatan: "REHAB",
    besarnyaBiaya: 35000000,
    keterangan: "Prioritas 2 RW 002"
  },
  {
    id: "usulan-3",
    jenisKegiatan: "Pemasangan Penerangan Jalan Umum (PJU) Swadaya",
    volume: "10 Titik",
    sifatKegiatan: "LAMA",
    besarnyaBiaya: 15000000,
    keterangan: "Usulan Non-Fisik / Lampu"
  }
];

export function DraftUsulanRw({ undanganData, onBack }: DraftUsulanRwProps) {
  const [usulanList, setUsulanList] = useState<UsulanItem[]>(defaultUsulanList);
  const [mounted, setMounted] = useState(false);

  const [headerData, setHeaderData] = useState<DraftUsulanRwData>({
    kpName: "Ciaruteun",
    rtNo: "004",
    rwNo: undanganData.rwNo || "002",
    tanggalUsulan: undanganData.tanggalAcara || "16 AGUSTUS 2026",
    tahunUsulan: undanganData.tahun || "2026",
    namaKetuaRt: "M. HARIS",
    namaKetuaRw: undanganData.namaKetuaRw || "SAEPULOH"
  });

  // Form state untuk tambah item usulan baru
  const [newJenisKegiatan, setNewJenisKegiatan] = useState("");
  const [newVolume, setNewVolume] = useState("1 Paket");
  const [newSifatKegiatan, setNewSifatKegiatan] = useState<"BARU" | "LAMA" | "REHAB">("BARU");
  const [newBesarnyaBiaya, setNewBesarnyaBiaya] = useState<number>(0);
  const [newKeterangan, setNewKeterangan] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update RW No & Ketua RW jika data undangan berubah
  useEffect(() => {
    setHeaderData((prev) => ({
      ...prev,
      rwNo: undanganData.rwNo,
      namaKetuaRw: undanganData.namaKetuaRw
    }));
  }, [undanganData]);

  const handleAddUsulan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJenisKegiatan) return;
    const newItem: UsulanItem = {
      id: `usulan-${Date.now()}`,
      jenisKegiatan: newJenisKegiatan,
      volume: newVolume || "1 Paket",
      sifatKegiatan: newSifatKegiatan,
      besarnyaBiaya: Number(newBesarnyaBiaya) || 0,
      keterangan: newKeterangan || "-"
    };
    setUsulanList([...usulanList, newItem]);
    setNewJenisKegiatan("");
    setNewVolume("1 Paket");
    setNewBesarnyaBiaya(0);
    setNewKeterangan("");
  };

  const handleDeleteUsulan = (id: string) => {
    setUsulanList(usulanList.filter((u) => u.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  // Pre-fill minimal 10 baris untuk tampilan cetak dokumen F4 Landscape yang rapi
  const displayRows = [...usulanList];
  while (displayRows.length < 10) {
    displayRows.push({
      id: `blank-${displayRows.length}`,
      jenisKegiatan: "",
      volume: "",
      sifatKegiatan: "BARU",
      besarnyaBiaya: 0,
      keterangan: ""
    });
  }

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return "-";
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const renderDraftUsulanContent = (isPortal = false) => (
    <div
      id={isPortal ? "draft-usulan-print-portal" : "draft-usulan-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative"
      style={{
        width: isPortal ? "330.2mm" : "100%",
        maxWidth: "330.2mm",
        minHeight: "215.9mm",
        padding: "12mm 15mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "11pt",
        lineHeight: "1.4"
      }}
    >
      {/* 1. JUDUL & KP / RT / RW (PERSIS GAMBAR) */}
      <div className="text-center font-bold text-[13pt] mb-6 uppercase tracking-wide">
        <div>FORM USULAN PERENCANAAN PEMBANGUNAN FISIK DAN NON FISIK</div>
        <div className="mt-1 text-[12pt]">
          KP. <span className="underline decoration-dotted px-2">{headerData.kpName || "...................................."}</span>{" "}
          RT. <span className="underline decoration-dotted px-2">{headerData.rtNo || ".........."}</span>{" "}
          RW. <span className="underline decoration-dotted px-2">{headerData.rwNo || ".........."}</span>
        </div>
      </div>

      {/* 2. TABEL DRAFT USULAN (PERSIS GAMBAR FORMAT BORDER BLACK) */}
      <table className="w-full border-collapse border border-black text-[10pt] table-fixed mb-8">
        <thead>
          <tr className="bg-slate-100 font-bold text-center border-b border-black">
            <th className="border border-black p-1.5 w-[35px]" rowSpan={2}>NO</th>
            <th className="border border-black p-1.5 text-center" rowSpan={2}>JENIS KEGIATAN</th>
            <th className="border border-black p-1.5 w-[110px]" rowSpan={2}>VOLUME</th>
            <th className="border border-black p-1 text-center" colSpan={3}>SIFAT KEGIATAN</th>
            <th className="border border-black p-1.5 w-[150px]" rowSpan={2}>BESARNYA BIAYA</th>
            <th className="border border-black p-1.5 w-[150px]" rowSpan={2}>KETERANGAN</th>
          </tr>
          <tr className="bg-slate-100 font-bold text-center border-b border-black">
            <th className="border border-black p-1 w-[50px]">BARU</th>
            <th className="border border-black p-1 w-[50px]">LAMA</th>
            <th className="border border-black p-1 w-[50px]">REHAB</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, idx) => (
            <tr key={row.id} className="h-[32px]">
              <td className="border border-black p-1 text-center font-medium">
                {row.jenisKegiatan ? idx + 1 : ""}
              </td>
              <td className="border border-black p-1 font-semibold px-2">
                {row.jenisKegiatan}
              </td>
              <td className="border border-black p-1 text-center font-medium">
                {row.volume}
              </td>
              <td className="border border-black p-1 text-center font-bold">
                {row.jenisKegiatan && row.sifatKegiatan === "BARU" ? "✓" : ""}
              </td>
              <td className="border border-black p-1 text-center font-bold">
                {row.jenisKegiatan && row.sifatKegiatan === "LAMA" ? "✓" : ""}
              </td>
              <td className="border border-black p-1 text-center font-bold">
                {row.jenisKegiatan && row.sifatKegiatan === "REHAB" ? "✓" : ""}
              </td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-2">
                {row.jenisKegiatan ? formatCurrency(row.besarnyaBiaya) : ""}
              </td>
              <td className="border border-black p-1 px-2 text-slate-800">
                {row.keterangan}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 3 & 4 & 5. TANDA TANGAN (KIRI: KETUA RW, KANAN: KETUA RT PERSIS GAMBAR) */}
      <div className="grid grid-cols-2 text-[11pt] mt-8">
        {/* Kiri: Mengetahui Ketua RW */}
        <div className="text-center w-[250px] mx-auto">
          <div>Mengetahui,</div>
          <div>Ketua RW {headerData.rwNo}</div>
          <div className="h-20"></div>
          <div className="font-bold underline uppercase tracking-wide">
            {headerData.namaKetuaRw}
          </div>
        </div>

        {/* Kanan: Tanggal & TTD Ketua RT */}
        <div className="text-center w-[250px] mx-auto">
          <div>
            Cimanggu I , {headerData.tanggalUsulan.includes(headerData.tahunUsulan) ? headerData.tanggalUsulan : `${headerData.tanggalUsulan} ${headerData.tahunUsulan}`}
          </div>
          <div>Ketua RT {headerData.rtNo}</div>
          <div className="h-20"></div>
          <div className="font-bold underline uppercase tracking-wide">
            {headerData.namaKetuaRt}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* CSS PRINT RULES FOR EXACT F4 LANDSCAPE CAMBRIA FORMAT */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body > *:not(#draft-usulan-print-portal) {
            display: none !important;
          }

          #draft-usulan-print-portal {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 100vh !important;
            margin: 0 auto !important;
            padding: 5mm 10mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
            box-sizing: border-box !important;
          }

          #draft-usulan-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
          }

          #draft-usulan-print-portal .grid {
            display: grid !important;
          }

          #draft-usulan-print-portal .flex {
            display: flex !important;
          }

          #draft-usulan-print-portal table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #draft-usulan-print-portal tr {
            display: table-row !important;
          }

          #draft-usulan-print-portal td, #draft-usulan-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
          }

          @page {
            size: 330.2mm 215.9mm; /* F4 Landscape Dimensions */
            margin: 10mm 15mm; /* Symmetric margins left and right */
          }
        }
      `}} />

      {/* TOP TOOLBAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer min-w-[44px] min-h-[44px]"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 mb-1">
              <Sparkles size={12} className="text-amber-600" />
              <span>DRAFT USULAN PEMBANGUNAN RW</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Form Usulan Perencanaan Pembangunan Fisik & Non-Fisik
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Format Resmi Cetak F4 Landscape (Font Cambria) Persis Lampiran Gambar
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
        >
          <Printer size={16} />
          <span>Cetak Form Usulan (F4 Landscape)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: FORM INPUT PERHATIANKAN 5 USER REQUIREMENTS */}
        <div className="lg:col-span-5 space-y-4 no-print">
          {/* HEADER FORM METADATA */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
              1, 3, 4, 5. Identitas Wilayah & Penandatangan Usulan
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">1. Kp</label>
                <input
                  type="text"
                  value={headerData.kpName}
                  onChange={(e) => setHeaderData({ ...headerData, kpName: e.target.value })}
                  placeholder="Ciaruteun"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">1. RT</label>
                <input
                  type="text"
                  value={headerData.rtNo}
                  onChange={(e) => setHeaderData({ ...headerData, rtNo: e.target.value })}
                  placeholder="004"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">1. RW</label>
                <input
                  type="text"
                  value={headerData.rwNo}
                  onChange={(e) => setHeaderData({ ...headerData, rwNo: e.target.value })}
                  placeholder="002"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">4. Tanggal Usulan</label>
                <input
                  type="text"
                  value={headerData.tanggalUsulan}
                  onChange={(e) => setHeaderData({ ...headerData, tanggalUsulan: e.target.value })}
                  placeholder="16 AGUSTUS 2026"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">4. Tahun</label>
                <input
                  type="text"
                  value={headerData.tahunUsulan}
                  onChange={(e) => setHeaderData({ ...headerData, tahunUsulan: e.target.value })}
                  placeholder="2026"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">3. Mengetahui Ketua RW</label>
                <input
                  type="text"
                  value={headerData.namaKetuaRw}
                  onChange={(e) => setHeaderData({ ...headerData, namaKetuaRw: e.target.value })}
                  placeholder="SAEPULOH"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">5. Nama Ketua RT</label>
                <input
                  type="text"
                  value={headerData.namaKetuaRt}
                  onChange={(e) => setHeaderData({ ...headerData, namaKetuaRt: e.target.value })}
                  placeholder="M. HARIS"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold uppercase"
                />
              </div>
            </div>
          </div>

          {/* FORM TAMBAH ITEM USULAN */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">2. Tambah Item Usulan Kegiatan</h3>
            <form onSubmit={handleAddUsulan} className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jenis Kegiatan</label>
                <input
                  type="text"
                  value={newJenisKegiatan}
                  onChange={(e) => setNewJenisKegiatan(e.target.value)}
                  placeholder="Contoh: Pengaspalan Jalan Lingkungan Kp. Ciaruteun"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Volume</label>
                  <input
                    type="text"
                    value={newVolume}
                    onChange={(e) => setNewVolume(e.target.value)}
                    placeholder="400 Meter / 1 Paket"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Sifat Kegiatan</label>
                  <select
                    value={newSifatKegiatan}
                    onChange={(e) => setNewSifatKegiatan(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="BARU">BARU</option>
                    <option value="LAMA">LAMA</option>
                    <option value="REHAB">REHAB</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Besarnya Biaya (Rp)</label>
                  <input
                    type="number"
                    value={newBesarnyaBiaya || ""}
                    onChange={(e) => setNewBesarnyaBiaya(Number(e.target.value))}
                    placeholder="120000000"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Keterangan</label>
                  <input
                    type="text"
                    value={newKeterangan}
                    onChange={(e) => setNewKeterangan(e.target.value)}
                    placeholder="Prioritas 1 RW 002"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus size={14} /> Tambah Item Ke Tabel Usulan
              </button>
            </form>
          </div>

          {/* LIST ITEM USULAN */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Daftar Item Usulan ({usulanList.length} Item)</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {usulanList.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {idx + 1}. {item.jenisKegiatan}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Vol: {item.volume} | Sifat: <strong className="text-emerald-700">{item.sifatKegiatan}</strong> | {formatCurrency(item.besarnyaBiaya)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUsulan(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Hapus Usulan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW HASIL CETAK PERSIS GAMBAR CETAK F4 LANDSCAPE */}
        <div className="lg:col-span-7">
          <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
            <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
              --- Preview Cetak Kertas F4 Landscape Cambria (Persis Gambar) ---
            </span>

            {/* ON-SCREEN PREVIEW */}
            {renderDraftUsulanContent(false)}
          </div>
        </div>
      </div>

      {/* REACT PORTAL DIRECT TO BODY FOR 100% RELIABLE PRINTING */}
      {mounted && createPortal(
        renderDraftUsulanContent(true),
        document.body
      )}
    </div>
  );
}
