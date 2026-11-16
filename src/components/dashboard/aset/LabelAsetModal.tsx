/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { Printer, X, Tag, Grid, LayoutTemplate, Loader2 } from "lucide-react";
import { AsetDesaItem } from "@/actions/asetDesa";

export function LabelAsetModal({
  item,
  onClose,
}: {
  item: AsetDesaItem | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [isQrReady, setIsQrReady] = useState<boolean>(false);
  const [labelSize, setLabelSize] = useState<"standard" | "compact" | "kib">("standard");
  const [printMode, setPrintMode] = useState<"single" | "grid">("single");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (item) {
      setIsQrReady(false);
      const qrPayload = item.qrData || `CMG1-AST:${item.kodeRegister}|${item.namaBarang}|${item.penanggungJawab}|${item.tahunPengadaan}`;
      QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 1,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then((url) => {
          setQrUrl(url);
          setIsQrReady(true);
        })
        .catch((err) => {
          console.error("Error generating QR:", err);
          setIsQrReady(true);
        });
    }
  }, [item]);

  if (!item) return null;

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Komponen Kartu Stiker Label Satuan (Re-usable untuk Single dan Grid A4)
  const renderStickerCard = (key?: number) => {
    const isCompact = labelSize === "compact";
    const isKib = labelSize === "kib";

    return (
      <div
        key={key}
        className="asset-sticker-card bg-white text-black p-3 rounded-lg border-2 border-black flex flex-col justify-between box-border"
        style={{
          width: isCompact ? "65mm" : isKib ? "105mm" : "85mm",
          height: isCompact ? "38mm" : isKib ? "65mm" : "50mm",
          fontFamily: "'Arial', 'Helvetica', sans-serif",
          pageBreakInside: "avoid",
          breakInside: "avoid",
        }}
      >
        {/* Kop Stiker Resmi Desa Cimanggu I */}
        <div className="flex items-center gap-2 border-b-2 border-black pb-1">
          <img
            src="/images/letters/logo_bogor.png"
            alt="Logo Bogor"
            loading="eager"
            className={`${isCompact ? "w-6 h-7" : isKib ? "w-10 h-11" : "w-8 h-9"} object-contain shrink-0`}
          />
          <div className="text-center flex-1 leading-tight">
            <h6 className={`${isCompact ? "text-[6pt]" : isKib ? "text-[8pt]" : "text-[7pt]"} font-black uppercase tracking-wider text-slate-800 m-0`}>
              PEMERINTAH KABUPATEN BOGOR
            </h6>
            <h5 className={`${isCompact ? "text-[7.5pt]" : isKib ? "text-[9.5pt]" : "text-[8.5pt]"} font-black uppercase tracking-wider text-black m-0`}>
              DESA CIMANGGU I
            </h5>
            <span className={`${isCompact ? "text-[5pt]" : isKib ? "text-[6.5pt]" : "text-[5.5pt]"} uppercase tracking-widest text-slate-700 font-extrabold block`}>
              INVENTARIS BARANG MILIK DESA
            </span>
          </div>
        </div>

        {/* Konten Utama Label: QR Code + Data Identitas Aset */}
        <div className="flex items-center gap-2.5 my-auto py-1">
          {/* QR Code Resmi Validasi */}
          <div className="shrink-0 flex flex-col items-center justify-center p-0.5 bg-white border border-black rounded">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="QR Code Aset"
                loading="eager"
                className={`${isCompact ? "w-14 h-14" : isKib ? "w-20 h-20" : "w-16 h-16"} object-contain`}
              />
            ) : (
              <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-[7pt] font-bold">
                <Loader2 size={16} className="animate-spin text-blue-600" />
              </div>
            )}
            <span className="text-[4.5pt] font-mono font-black tracking-tighter text-black mt-0.5">
              SCAN VERIFIKASI
            </span>
          </div>

          {/* Teks Identitas Barang */}
          <div className="flex-1 space-y-0.5 leading-tight text-left overflow-hidden">
            <div className="font-mono font-black text-[8pt] text-blue-900 tracking-wide bg-slate-100 px-1 py-0.5 rounded border border-slate-300 inline-block truncate max-w-full">
              {item.kodeRegister}
            </div>
            <h4 className={`font-bold ${isCompact ? "text-[7.5pt]" : isKib ? "text-[9pt]" : "text-[8pt]"} text-black line-clamp-2 mt-0.5`}>
              {item.namaBarang}
            </h4>
            <div className="text-[6.5pt] text-slate-700 font-semibold truncate">
              Merek / Tipe: <span className="font-bold text-black">{item.merekTipe || "-"}</span>
            </div>
            <div className="text-[6pt] text-slate-600 truncate">
              Bidang: <span className="font-bold text-black">{item.bidangLabel}</span>
            </div>
            <div className="text-[6pt] text-slate-600 flex justify-between pt-0.5 border-t border-slate-200">
              <span>Tahun: <b>{item.tahunPengadaan}</b></span>
              <span>Kondisi: <b>{item.kondisi}</b></span>
            </div>
          </div>
        </div>

        {/* Footer Barcode Garis & Lokasi / PIC */}
        <div className="border-t border-black pt-0.5 flex items-center justify-between text-[6pt] font-bold text-slate-900">
          <span className="truncate max-w-[140px]">
            📍 {item.lokasi} ({item.penanggungJawab})
          </span>
          <span className="font-mono tracking-widest text-[6.5pt]">
            |||| ||||| || ||||
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── MODAL DIALOG ON-SCREEN (PRATINJAU INTERAKTIF) ── */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Dialog */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Cetak Label Inventaris Aset Desa</h3>
                <p className="text-xs text-slate-500">Stiker label fisik dengan Barcode & QR Code terverifikasi.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Toolbar Pilihan Ukuran & Mode Cetak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs font-bold">
            {/* Format Ukuran */}
            <div className="space-y-1.5">
              <span className="text-slate-500 text-[11px] font-black uppercase tracking-wider block">Format Stiker:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "standard", label: "Standar (85×50mm)" },
                  { id: "compact", label: "Ringkas (65×38mm)" },
                  { id: "kib", label: "Ruangan (105×65mm)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setLabelSize(s.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition-all text-[11px] font-black cursor-pointer ${
                      labelSize === s.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Cetak (1 Stiker vs Lembar A4) */}
            <div className="space-y-1.5">
              <span className="text-slate-500 text-[11px] font-black uppercase tracking-wider block">Tata Letak Cetak:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPrintMode("single")}
                  className={`flex-1 px-3 py-1.5 rounded-xl transition-all text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                    printMode === "single"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <LayoutTemplate size={14} />
                  <span>1 Stiker Satuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintMode("grid")}
                  className={`flex-1 px-3 py-1.5 rounded-xl transition-all text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer ${
                    printMode === "grid"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Grid size={14} />
                  <span>Lembar A4 (8 Pcs)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pratinjau Tampilan Stiker */}
          <div className="bg-slate-200/80 p-5 rounded-2xl flex flex-col items-center justify-center overflow-x-auto min-h-[220px]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pratinjau Hasil Cetak ({labelSize.toUpperCase()} - {printMode === "grid" ? "Mode Lembar Kertas" : "Mode Satuan"}):
            </div>
            <div className="shadow-lg rounded-xl overflow-hidden bg-white">
              {renderStickerCard()}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-semibold">
              Kertas stiker label akan diprint bersih tanpa tombol/sidebar.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={!isQrReady}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {!isQrReady ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
              <span>Cetak Label Stiker Ini</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── PORTAL CETAK KHUSUS STIKER LABEL ASET (MOUNT LANGSUNG KE DOCUMENT.BODY) ── */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div id="asset-label-print-portal" style={{ display: "none" }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              @media screen {
                #asset-label-print-portal {
                  display: none !important;
                }
              }
              @media print {
                @page {
                  size: ${printMode === "grid" ? "A4 portrait" : "auto"};
                  margin: ${printMode === "grid" ? "10mm" : "5mm"};
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                body > *:not(#asset-label-print-portal) {
                  display: none !important;
                }
                #asset-label-print-portal {
                  display: block !important;
                  visibility: visible !important;
                  position: relative !important;
                  width: 100% !important;
                  margin: 0 auto !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                }
                #asset-label-print-portal * {
                  visibility: visible !important;
                }
              }
            `
          }} />

          {printMode === "single" ? (
            <div className="flex items-center justify-start p-2">
              {renderStickerCard()}
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-4 p-2"
              style={{
                width: "190mm",
                margin: "0 auto",
              }}
            >
              {Array.from({ length: 8 }).map((_, idx) => renderStickerCard(idx))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
