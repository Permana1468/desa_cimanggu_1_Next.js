/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, X, FileSpreadsheet, ZoomIn, ZoomOut, CheckCircle2 } from "lucide-react";
import { AsetDesaItem } from "@/actions/asetDesa";

export function BukuKibModal({
  isOpen,
  onClose,
  items,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: AsetDesaItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const [filterBidang, setFilterBidang] = useState<string>("ALL");
  const [paperSize, setPaperSize] = useState<"A4" | "F4">("A4");
  const [scale, setScale] = useState<number>(100);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (filterBidang === "ALL") return true;
    return item.bidang === filterBidang;
  });

  // Hitung total valuasi dan rekap per kondisi
  const totalValuasi = filteredItems.reduce((acc, curr) => acc + (curr.nilaiPerolehan || 0), 0);
  const totalBaik = filteredItems.filter((i) => i.kondisi === "BAIK").length;
  const totalKurangBaik = filteredItems.filter((i) => i.kondisi === "KURANG_BAIK").length;
  const totalRusak = filteredItems.filter((i) => i.kondisi === "RUSAK_BERAT").length;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Komponen Isi Dokumen KIB Resmi (Digunakan di Pratinjau & di Print Portal)
  const renderKibDocumentContent = (isPrintDoc = false) => {
    return (
      <div
        className="kib-document bg-white text-black mx-auto box-border"
        style={{
          width: isPrintDoc ? "100%" : "100%",
          padding: isPrintDoc ? "0" : "24px 32px",
          fontFamily: "'Times New Roman', Times, serif",
          transform: !isPrintDoc && scale !== 100 ? `scale(${scale / 100})` : undefined,
          transformOrigin: "top center",
        }}
      >
        {/* ── KOP SURAT RESMI PEMERINTAH DESA CIMANGGU I ── */}
        <div className="flex items-center justify-between border-b-[3px] border-black pb-2 mb-1">
          <div className="w-16 shrink-0 flex justify-center">
            <img
              src="/images/letters/logo_bogor.png"
              alt="Logo Kabupaten Bogor"
              className="w-16 h-20 object-contain"
            />
          </div>
          <div className="flex-1 text-center leading-snug px-3">
            <h4 className="text-[11pt] font-bold tracking-wider uppercase text-black m-0">
              PEMERINTAH KABUPATEN BOGOR
            </h4>
            <h3 className="text-[13pt] font-black tracking-wider uppercase text-black m-0">
              KECAMATAN CIBUNGBULANG
            </h3>
            <h2 className="text-[16pt] font-black tracking-wider uppercase text-black m-0">
              PEMERINTAH DESA CIMANGGU I
            </h2>
            <p className="text-[8.5pt] italic text-slate-900 mt-1 mb-0 font-serif">
              Jl. Raya Gardu Seri Kp. Cianteun RT.004 RW.008 Desa Cimanggu I Kec. Cibungbulang Kab. Bogor - 16630
            </p>
          </div>
          <div className="w-16 shrink-0" />
        </div>
        {/* Garis Ganda Kop Surat */}
        <div className="border-b border-black mb-4" />

        {/* ── JUDUL DOKUMEN BUKU INVENTARIS KIB ── */}
        <div className="text-center mb-4 leading-tight">
          <h2 className="text-[12pt] font-bold uppercase underline tracking-wider text-black m-0">
            BUKU INVENTARIS ASET DAN REKAPITULASI BARANG MILIK DESA
          </h2>
          <p className="text-[9.5pt] font-bold uppercase tracking-wider text-black mt-1 mb-0">
            TAHUN ANGGARAN 2026
          </p>
          <span className="text-[8pt] italic text-slate-700 block mt-0.5">
            Berdasarkan Peraturan Menteri Dalam Negeri Republik Indonesia Nomor 1 Tahun 2016 tentang Pengelolaan Aset Desa
          </span>
        </div>

        {/* Metadata Identitas Wilayah */}
        <div className="flex justify-between text-[8.5pt] font-bold mb-2.5 border-b border-slate-300 pb-1.5">
          <div>
            <span>DESA : CIMANGGU I</span> &nbsp;|&nbsp; <span>KECAMATAN : CIBUNGBULANG</span>
          </div>
          <div>
            <span>KABUPATEN : BOGOR</span> &nbsp;|&nbsp; <span>PROVINSI : JAWA BARAT</span>
          </div>
        </div>

        {/* Ringkasan Rekapitulasi Singkat */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-[8pt] font-bold border border-black p-2 bg-slate-50">
          <div>
            <span className="text-slate-600 block text-[6.5pt] uppercase">Total Item Terdaftar:</span>
            <strong className="text-[9.5pt]">{filteredItems.length} Aset / Unit</strong>
          </div>
          <div>
            <span className="text-slate-600 block text-[6.5pt] uppercase">Kondisi Baik:</span>
            <strong className="text-[9.5pt] text-emerald-800">{totalBaik} Unit</strong>
          </div>
          <div>
            <span className="text-slate-600 block text-[6.5pt] uppercase">Perlu Perbaikan / Rusak:</span>
            <strong className="text-[9.5pt] text-amber-800">{totalKurangBaik + totalRusak} Unit</strong>
          </div>
          <div>
            <span className="text-slate-600 block text-[6.5pt] uppercase">Total Valuasi Aset:</span>
            <strong className="text-[9.5pt] text-blue-900">{formatRupiah(totalValuasi)}</strong>
          </div>
        </div>

        {/* ── TABEL INVENTARIS ASET RESMI KIB (PERMENDAGRI 1/2016) ── */}
        <table 
          className="w-full border-collapse border border-black text-[7.5pt] text-black"
          style={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr className="bg-slate-200 text-center font-bold">
              <th className="border border-black p-1" style={{ width: "3%" }}>NO</th>
              <th className="border border-black p-1" style={{ width: "13%" }}>KODE REGISTER</th>
              <th className="border border-black p-1" style={{ width: "17%" }}>NAMA BARANG & SPESIFIKASI</th>
              <th className="border border-black p-1" style={{ width: "11%" }}>MEREK / NO. RANGKA</th>
              <th className="border border-black p-1" style={{ width: "8%" }}>BIDANG KIB</th>
              <th className="border border-black p-1" style={{ width: "8%" }}>ASAL USUL</th>
              <th className="border border-black p-1" style={{ width: "4%" }}>THN</th>
              <th className="border border-black p-1" style={{ width: "5%" }}>VOL</th>
              <th className="border border-black p-1" style={{ width: "10%" }}>NILAI (RP)</th>
              <th className="border border-black p-1" style={{ width: "5%" }}>KONDISI</th>
              <th className="border border-black p-1" style={{ width: "9%" }}>LOKASI & PIC</th>
              <th className="border border-black p-1" style={{ width: "7%" }}>KET</th>
            </tr>
            <tr className="bg-slate-100 text-center text-[6pt] font-semibold text-slate-600">
              <td className="border border-black p-0.5">1</td>
              <td className="border border-black p-0.5">2</td>
              <td className="border border-black p-0.5">3</td>
              <td className="border border-black p-0.5">4</td>
              <td className="border border-black p-0.5">5</td>
              <td className="border border-black p-0.5">6</td>
              <td className="border border-black p-0.5">7</td>
              <td className="border border-black p-0.5">8</td>
              <td className="border border-black p-0.5">9</td>
              <td className="border border-black p-0.5">10</td>
              <td className="border border-black p-0.5">11</td>
              <td className="border border-black p-0.5">12</td>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id} className="align-top">
                <td className="border border-black p-1 text-center font-bold">
                  {idx + 1}
                </td>
                <td className="border border-black p-1 font-mono font-bold text-[7pt] break-words">
                  {item.kodeRegister}
                </td>
                <td className="border border-black p-1 font-bold break-words">
                  {item.namaBarang}
                  {item.kategori && (
                    <span className="block font-normal text-[6.5pt] text-slate-600">
                      Kat: {item.kategori}
                    </span>
                  )}
                </td>
                <td className="border border-black p-1 text-[7pt] break-words">
                  <div>{item.merekTipe || "-"}</div>
                  {item.nomorRangkaSeri && (
                    <div className="font-mono text-[6pt] text-slate-600">{item.nomorRangkaSeri}</div>
                  )}
                </td>
                <td className="border border-black p-1 text-center text-[6.5pt] font-semibold break-words">
                  {item.bidang === "BARANG_KANTOR"
                    ? "KIB B (Peralatan)"
                    : item.bidang === "GEDUNG_BANGUNAN"
                    ? "KIB C (Gedung)"
                    : item.bidang === "PEMBANGUNAN_INFRASTRUKTUR"
                    ? "KIB D (Jalan/Fisik)"
                    : item.bidang === "TANAH_DESA"
                    ? "KIB A (Tanah)"
                    : "KIB E (Lainnya)"}
                </td>
                <td className="border border-black p-1 text-[6.5pt] break-words">
                  {item.sumberDana || "APBDes"}
                </td>
                <td className="border border-black p-1 text-center font-bold">
                  {item.tahunPengadaan}
                </td>
                <td className="border border-black p-1 text-center">
                  {item.volume} {item.satuan}
                </td>
                <td className="border border-black p-1 text-right font-mono font-bold text-[7pt]">
                  {formatRupiah(item.nilaiPerolehan)}
                </td>
                <td className="border border-black p-1 text-center font-bold text-[6.5pt]">
                  {item.kondisi === "BAIK" ? (
                    <span className="text-black">Baik</span>
                  ) : item.kondisi === "KURANG_BAIK" ? (
                    <span className="text-amber-800">Kurang Baik</span>
                  ) : (
                    <span className="text-red-700">Rusak Berat</span>
                  )}
                </td>
                <td className="border border-black p-1 text-[6.5pt] break-words">
                  <div>📍 {item.lokasi}</div>
                  <div className="text-slate-600 font-semibold">PIC: {item.penanggungJawab}</div>
                </td>
                <td className="border border-black p-1 text-[6pt] text-slate-700 break-words">
                  {item.keterangan || "Tercatat di Buku Inventaris Desa"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-200 font-black text-black">
              <td colSpan={8} className="border border-black p-1.5 text-right uppercase tracking-wider text-[7.5pt]">
                TOTAL KESELURUHAN NILAI INVENTARIS:
              </td>
              <td className="border border-black p-1.5 text-right font-mono text-[8pt] text-black">
                {formatRupiah(totalValuasi)}
              </td>
              <td colSpan={3} className="border border-black p-1.5 text-center text-[7pt]">
                {filteredItems.length} Item Terdaftar
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ── BAGIAN TANDA TANGAN LEGAL PENGESAHAN (KADES & KAUR TU) ── */}
        <div className="mt-6 pt-2 flex justify-between items-start text-center text-[9pt] leading-snug break-inside-avoid">
          {/* Mengetahui Kepala Desa */}
          <div className="w-64">
            <p className="m-0">Mengetahui,</p>
            <p className="font-bold uppercase m-0">KEPALA DESA CIMANGGU I</p>
            <div className="h-20 relative flex items-center justify-center my-1">
              <img
                src="/images/letters/stempel_ttd_kades.png"
                alt="Stempel & TTD Kades"
                className="h-20 object-contain"
              />
            </div>
            <p className="font-bold underline uppercase tracking-wider text-black m-0">
              HERNAWAN M. SODIK
            </p>
            <span className="text-[7.5pt] text-slate-700 block">NIPD. 2018.01.001</span>
          </div>

          {/* Pengurus / Pengelola Barang (Kaur TU & Umum) */}
          <div className="w-64">
            <p className="m-0">Cimanggu I, {todayStr}</p>
            <p className="font-bold uppercase m-0">PENGURUS BARANG MILIK DESA</p>
            <p className="font-semibold text-[8pt] m-0 text-slate-700">Kaur Tata Usaha & Umum</p>
            <div className="h-20 flex items-center justify-center my-1">
              <span className="text-[8pt] text-slate-400 italic">
                ( Tanda Tangan Asli )
              </span>
            </div>
            <p className="font-bold underline uppercase tracking-wider text-black m-0">
              KAUR TATA USAHA & UMUM
            </p>
            <span className="text-[7.5pt] text-slate-700 block">NIPD. 2019.04.004</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── MODAL PRATINJAU INTERAKTIF ON-SCREEN ── */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-between p-3 md:p-6 print:hidden">
        {/* Header Toolbar */}
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Buku Inventaris & Rekapitulasi KIB Desa Cimanggu I
              </h3>
              <p className="text-xs text-slate-500">
                Format resmi sesuai Permendagri No. 1 Tahun 2016 tentang Pengelolaan Aset Desa.
              </p>
            </div>
          </div>

          {/* Controls: Filter Bidang, Ukuran Kertas, Zoom */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Bidang */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <span className="text-slate-500 text-[10px] pl-2 font-black">Bidang:</span>
              <select
                value={filterBidang}
                onChange={(e) => setFilterBidang(e.target.value)}
                className="bg-white text-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="ALL">Semua Bidang KIB (Lengkap)</option>
                <option value="BARANG_KANTOR">KIB B - Peralatan & Mesin</option>
                <option value="GEDUNG_BANGUNAN">KIB C - Gedung & Bangunan</option>
                <option value="PEMBANGUNAN_INFRASTRUKTUR">KIB D - Pembangunan / Fisik</option>
                <option value="TANAH_DESA">KIB A - Tanah Kas Desa</option>
                <option value="ASET_LAINNYA">KIB E - Aset Lainnya</option>
              </select>
            </div>

            {/* Pilihan Kertas */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaperSize("A4")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  paperSize === "A4" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                A4 Lanskap
              </button>
              <button
                type="button"
                onClick={() => setPaperSize("F4")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  paperSize === "F4" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                F4 / Folio
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setScale(Math.max(70, scale - 5))}
                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-slate-200 cursor-pointer"
                title="Perkecil"
              >
                <ZoomOut size={14} />
              </button>
              <span className="px-2 text-[11px] font-mono">{scale}%</span>
              <button
                type="button"
                onClick={() => setScale(Math.min(120, scale + 5))}
                className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-700 hover:bg-slate-200 cursor-pointer"
                title="Perbesar"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Print Action */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer size={16} />
              <span>Cetak Buku KIB (Print/PDF)</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Workspace Pratinjau Dokumen (Scrollable) */}
        <div className="flex-1 overflow-auto my-3 p-4 bg-slate-800/60 rounded-2xl flex justify-center items-start">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 w-full max-w-[1240px]">
            {renderKibDocumentContent(false)}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-2.5 shadow border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600 shrink-0">
          <span className="flex items-center gap-1.5 text-blue-700">
            <CheckCircle2 size={15} />
            Format dokumen siap cetak lanskap A4/F4 dengan Kop Resmi dan Stempel Pengesahan Kepala Desa.
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {filteredItems.length} Data Aset Terpilih
          </span>
        </div>
      </div>

      {/* ── PORTAL CETAK DOKUMEN RESMI KIB (MOUNT LANGSUNG KE DOCUMENT.BODY) ── */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div id="kib-document-print-portal" style={{ display: "none" }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              @media screen {
                #kib-document-print-portal {
                  display: none !important;
                }
              }
              @media print {
                @page {
                  size: ${paperSize === "F4" ? "330.2mm 215.9mm" : "297mm 210mm"} landscape;
                  margin: 8mm 10mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                body > *:not(#kib-document-print-portal) {
                  display: none !important;
                }
                #kib-document-print-portal {
                  display: block !important;
                  visibility: visible !important;
                  position: relative !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                }
                #kib-document-print-portal * {
                  visibility: visible !important;
                }
                table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  page-break-inside: auto !important;
                }
                thead {
                  display: table-header-group !important;
                }
                tr {
                  page-break-inside: avoid !important;
                  page-break-after: auto !important;
                }
              }
            `
          }} />
          {renderKibDocumentContent(true)}
        </div>,
        document.body
      )}
    </>
  );
}
