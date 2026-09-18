"use client";

import React, { useState, useEffect } from "react";
import { Printer, ArrowLeft, Settings, Save, RotateCcw, Check, FileText } from "lucide-react";

interface CetakHargaSatuanProps {
  data: any;
  onBack: () => void;
}

export function CetakHargaSatuan({ data, onBack }: CetakHargaSatuanProps) {
  // State SK Header Metadata with Defaults matching latest SK
  const [skMeta, setSkMeta] = useState({
    lampiran: "Keputusan Kepala Desa Cimanggu I",
    nomor: "400.10.2.4/13/Kpts/X/2025",
    tanggal: "11 Oktober 2025",
    tentang: "Penetapan Standar Satuan Harga Belanja Desa Cimanggu I Tahun Anggaran 2026",
    kotaTtd: "Cimanggu I",
    tanggalTtd: "11 Oktober 2025",
    namaKades: "HERNAWAN M. SODIK",
    jabatanKades: "KEPALA DESA CIMANGGU I"
  });

  const [showForm, setShowForm] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  // Load from LocalStorage if available
  useEffect(() => {
    document.title = "LAMPIRAN_SSH_DESA_CIMANGGU_I_2026";
    const saved = localStorage.getItem("ssh_sk_meta_config");
    if (saved) {
      try {
        setSkMeta(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved SK metadata", e);
      }
    }
    return () => {
      document.title = "Aplikasi Desa";
    };
  }, []);

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ssh_sk_meta_config", JSON.stringify(skMeta));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetDefault = () => {
    const defaultMeta = {
      lampiran: "Keputusan Kepala Desa Cimanggu I",
      nomor: "400.10.2.4/13/Kpts/X/2025",
      tanggal: "11 Oktober 2025",
      tentang: "Penetapan Standar Satuan Harga Belanja Desa Cimanggu I Tahun Anggaran 2026",
      kotaTtd: "Cimanggu I",
      tanggalTtd: "11 Oktober 2025",
      namaKades: "HERNAWAN M. SODIK",
      jabatanKades: "KEPALA DESA CIMANGGU I"
    };
    setSkMeta(defaultMeta);
    localStorage.removeItem("ssh_sk_meta_config");
  };

  // Helper function to generate clean print HTML content for isolated frame printing
  const generatePrintHtml = () => {
    const categories = Object.keys(data);
    let tableRowsHtml = "";

    if (categories.length === 0) {
      tableRowsHtml = `
        <tr>
          <td colspan="5" style="border:1px solid #000; padding:12px; text-align:center; font-weight:bold;">
            Belum ada data Standar Satuan Harga untuk dicetak.
          </td>
        </tr>
      `;
    } else {
      categories.forEach((kat, katIdx) => {
        // Category Header
        tableRowsHtml += `
          <tr style="background-color: #f1f5f9; font-weight: bold; page-break-inside: avoid;">
            <td style="border: 1px solid #000; padding: 6px; text-align: center; font-size: 11px;">${katIdx + 1}</td>
            <td style="border: 1px solid #000; padding: 6px; font-weight: 900; text-transform: uppercase; font-size: 11px;" colspan="4">${kat}</td>
          </tr>
        `;

        // Category Items (Sorted A-Z by Uraian)
        const sortedCategoryItems = [...data[kat]].sort((a: any, b: any) => (a.uraian || "").localeCompare(b.uraian || "", "id", { sensitivity: "base" }));
        sortedCategoryItems.forEach((item: any, idx: number) => {
          const formattedPrice = item.harga ? Number(item.harga).toLocaleString('id-ID') : "0";
          tableRowsHtml += `
            <tr style="page-break-inside: avoid;">
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 10px;"></td>
              <td style="border: 1px solid #000; padding: 5px; font-size: 10.5px;">
                <div style="display: flex;">
                  <span style="width: 24px; flex-shrink: 0; color: #334155;">${idx + 1}.</span>
                  <span style="font-weight: 600;">${item.uraian || ''}</span>
                </div>
              </td>
              <td style="border: 1px solid #000; padding: 5px; text-align: center; font-size: 10.5px;">${item.satuan || ''}</td>
              <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold; font-size: 10.5px; white-space: nowrap;">${formattedPrice},-</td>
              <td style="border: 1px solid #000; padding: 5px; font-size: 10px; color: #334155;">${item.keterangan || '-'}</td>
            </tr>
          `;
        });
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LAMPIRAN_SSH_DESA_CIMANGGU_I_2026</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: 215.9mm 330.2mm; /* F4 paper size */
            margin: 15mm 12mm 15mm 12mm;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .doc-container {
            width: 100%;
            max-width: 215.9mm;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .header-box {
            margin-bottom: 16px;
            font-size: 11px;
            line-height: 1.6;
            border-bottom: 2px solid #000000;
            padding-bottom: 10px;
          }
          .header-table {
            width: 100%;
            border-collapse: collapse;
          }
          .header-table td {
            vertical-align: top;
            padding: 2px 0;
          }
          .ssh-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10.5px;
            line-height: 1.3;
          }
          .ssh-table th {
            border: 1px solid #000000;
            background-color: #f1f5f9;
            padding: 7px 5px;
            font-weight: bold;
            text-align: center;
          }
          .ssh-table td {
            border: 1px solid #000000;
            padding: 5px;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .signature-box {
            margin-top: 32px;
            display: flex;
            justify-content: flex-end;
            page-break-inside: avoid;
          }
          .signature-content {
            text-align: center;
            width: 260px;
            font-size: 11px;
          }
          .signature-name {
            margin-top: 70px;
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            font-size: 12px;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="doc-container">
          <!-- Header SK -->
          <div class="header-box">
            <table class="header-table">
              <tbody>
                <tr>
                  <td style="width: 80px; font-weight: bold;">Lampiran</td>
                  <td style="width: 15px;">:</td>
                  <td style="font-weight: bold;">${skMeta.lampiran}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Nomor</td>
                  <td>:</td>
                  <td style="font-weight: bold;">${skMeta.nomor}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Tanggal</td>
                  <td>:</td>
                  <td>${skMeta.tanggal}</td>
                </tr>
                <tr>
                  <td style="font-weight: bold;">Tentang</td>
                  <td>:</td>
                  <td style="font-weight: bold;">${skMeta.tentang}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Table Content -->
          <table class="ssh-table">
            <thead>
              <tr>
                <th style="width: 35px;">NO</th>
                <th>URAIAN</th>
                <th style="width: 80px;">SATUAN</th>
                <th style="width: 110px;">HARGA (Rp)</th>
                <th style="width: 110px;">KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>

          <!-- Signature Block -->
          <div class="signature-box">
            <div class="signature-content">
              <div>${skMeta.kotaTtd}, ${skMeta.tanggalTtd}</div>
              <div style="font-weight: bold; text-transform: uppercase; margin-top: 4px;">${skMeta.jabatanKades}</div>
              <div class="signature-name">${skMeta.namaKades}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // 100% Reliable Print function via hidden iframe (isolated document)
  const handlePrint = () => {
    const htmlContent = generatePrintHtml();

    let iframe = document.getElementById("ssh-print-iframe") as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "ssh-print-iframe";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);
    }

    const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 200);
    } else {
      // Popup window fallback
      const printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.open();
        printWin.document.write(htmlContent);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          printWin.print();
        }, 200);
      }
    }
  };

  return (
    <div className="bg-slate-100/90 min-h-screen py-6 px-4 sm:px-6 animate-in fade-in duration-300">
      
      {/* Control Panel (Hidden during Print) */}
      <div className="max-w-[215.9mm] mx-auto mb-6 space-y-4 no-print">
        
        {/* Navigation & Action Bar - Light Harmonized Theme */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 transition-all border border-slate-200"
            >
              <ArrowLeft size={16} /> Kembali ke Dashboard
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all border ${
                showForm 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Settings size={16} /> {showForm ? "Sembunyikan Form Parameter SK" : "Edit Parameter SK Terbaru"}
            </button>
          </div>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Printer size={18} /> CETAK SEKARANG (UKURAN F4)
          </button>
        </div>

        {/* Dynamic Form Panel for SK Metadata - Light Theme */}
        {showForm && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-emerald-600" /> Form Parameter Lampiran SK Terbaru
              </h3>
              {savedNotice && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <Check size={14} /> Parameter SK Tersimpan
                </span>
              )}
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lampiran</label>
                  <input 
                    type="text" 
                    value={skMeta.lampiran} 
                    onChange={e => setSkMeta({...skMeta, lampiran: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor SK</label>
                  <input 
                    type="text" 
                    value={skMeta.nomor} 
                    onChange={e => setSkMeta({...skMeta, nomor: e.target.value})} 
                    placeholder="Contoh: 400.10.2.4/13/Kpts/X/2025"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal SK</label>
                  <input 
                    type="text" 
                    value={skMeta.tanggal} 
                    onChange={e => setSkMeta({...skMeta, tanggal: e.target.value})} 
                    placeholder="Contoh: 11 Oktober 2025"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kota & Tanggal TTD</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={skMeta.kotaTtd} 
                      onChange={e => setSkMeta({...skMeta, kotaTtd: e.target.value})} 
                      placeholder="Cimanggu I"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                    <input 
                      type="text" 
                      value={skMeta.tanggalTtd} 
                      onChange={e => setSkMeta({...skMeta, tanggalTtd: e.target.value})} 
                      placeholder="11 Oktober 2025"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tentang SK</label>
                <textarea 
                  rows={2}
                  value={skMeta.tentang} 
                  onChange={e => setSkMeta({...skMeta, tentang: e.target.value})} 
                  placeholder="Penetapan Standar Satuan Harga Belanja Desa Cimanggu I Tahun Anggaran 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jabatan Penandatangan</label>
                  <input 
                    type="text" 
                    value={skMeta.jabatanKades} 
                    onChange={e => setSkMeta({...skMeta, jabatanKades: e.target.value})} 
                    placeholder="KEPALA DESA CIMANGGU I"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Kepala Desa</label>
                  <input 
                    type="text" 
                    value={skMeta.namaKades} 
                    onChange={e => setSkMeta({...skMeta, namaKades: e.target.value})} 
                    placeholder="HERNAWAN M. SODIK"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all uppercase"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <Save size={14} /> Simpan Parameter SK
                </button>

                <button 
                  type="button" 
                  onClick={handleResetDefault}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all border border-slate-200"
                >
                  <RotateCcw size={14} /> Reset ke SK 2026 Default
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Lembar Dokumen Preview Ukuran F4 (215.9mm x 330.2mm) - Light UI */}
      <div 
        id="preview-sk-sheet"
        className="bg-white mx-auto shadow-md border border-slate-200/90" 
        style={{
          width: '215.9mm',
          minHeight: '330.2mm',
          padding: '16mm 15mm 20mm 15mm',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#000000',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Header Dokumen Lampiran SK */}
        <div className="mb-5 text-[11px] leading-relaxed border-b-2 border-black pb-3">
          <table className="w-full border-none">
            <tbody>
              <tr>
                <td className="w-24 font-bold align-top py-0.5">Lampiran</td>
                <td className="w-4 align-top py-0.5">:</td>
                <td className="align-top font-bold py-0.5">{skMeta.lampiran}</td>
              </tr>
              <tr>
                <td className="font-bold align-top py-0.5">Nomor</td>
                <td className="align-top py-0.5">:</td>
                <td className="align-top font-bold py-0.5">{skMeta.nomor}</td>
              </tr>
              <tr>
                <td className="font-bold align-top py-0.5">Tanggal</td>
                <td className="align-top py-0.5">:</td>
                <td className="align-top py-0.5">{skMeta.tanggal}</td>
              </tr>
              <tr>
                <td className="font-bold align-top py-0.5">Tentang</td>
                <td className="align-top py-0.5">:</td>
                <td className="align-top font-bold py-0.5">{skMeta.tentang}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel Standar Satuan Harga */}
        <table className="w-full border-collapse border border-black text-[10.5px] leading-tight">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-2 font-bold w-10 text-center">NO</th>
              <th className="border border-black p-2 font-bold text-center">URAIAN</th>
              <th className="border border-black p-2 font-bold w-24 text-center">SATUAN</th>
              <th className="border border-black p-2 font-bold w-32 text-center">HARGA (Rp)</th>
              <th className="border border-black p-2 font-bold w-32 text-center">KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).length === 0 ? (
              <tr>
                <td colSpan={5} className="border border-black p-6 text-center text-slate-500 font-bold">
                  Belum ada data Standar Satuan Harga untuk dicetak.
                </td>
              </tr>
            ) : (
              Object.keys(data).map((kategori, katIdx) => (
                <React.Fragment key={kategori}>
                  {/* Baris Judul Kategori */}
                  <tr className="bg-slate-100/90 font-bold">
                    <td className="border border-black p-1.5 text-center align-top font-bold text-[11px]">
                      {katIdx + 1}
                    </td>
                    <td className="border border-black p-1.5 font-black text-[11px] uppercase tracking-wide" colSpan={4}>
                      {kategori}
                    </td>
                  </tr>

                  {/* Baris Item Barang / Jasa / Honor */}
                  {data[kategori].map((item: any, idx: number) => (
                    <tr key={item.id || idx}>
                      <td className="border border-black p-1.5 align-top text-center text-[10px]"></td>
                      <td className="border border-black p-1.5 align-top">
                        <div className="flex">
                          <span className="w-6 shrink-0 text-slate-700">{idx + 1}.</span>
                          <span className="font-semibold">{item.uraian}</span>
                        </div>
                      </td>
                      <td className="border border-black p-1.5 align-top text-center font-medium">
                        {item.satuan}
                      </td>
                      <td className="border border-black p-1.5 align-top text-right font-bold whitespace-nowrap">
                        {item.harga?.toLocaleString('id-ID')},-
                      </td>
                      <td className="border border-black p-1.5 align-top text-[10px] text-slate-700">
                        {item.keterangan || "-"}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        {/* Blok Tanda Tangan Penandatangan SK */}
        <div className="mt-8 flex justify-end pr-4">
          <div className="text-center w-72 text-[11px]">
            <p className="mb-1">{skMeta.kotaTtd}, {skMeta.tanggalTtd}</p>
            <p className="mb-20 font-bold uppercase">{skMeta.jabatanKades}</p>
            <p className="font-bold underline uppercase text-[12px]">{skMeta.namaKades}</p>
          </div>
        </div>

      </div>

    </div>
  );
}
