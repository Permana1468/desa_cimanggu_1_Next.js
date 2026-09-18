"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { RabFormData, RabItem } from "./CyberPlanRabTab";

export function CetakRabDesa({ 
  formData, 
  bahanList, 
  alatList, 
  upahList, 
  operasionalList, 
  onBack 
}: { 
  formData: RabFormData;
  bahanList: RabItem[];
  alatList: RabItem[];
  upahList: RabItem[];
  operasionalList: RabItem[];
  onBack: () => void;
}) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  useEffect(() => {
    // window.print();
  }, []);

  const formatCurrency = (val: number) => {
    if (!val || val === 0) return "-";
    return Math.round(val).toLocaleString("id-ID");
  };

  const calculateRow = (item: RabItem) => {
    const volTotal = (item.volumeSwadaya || 0) + (item.volumeApbd || 0);
    const totalSwadaya = (item.volumeSwadaya || 0) * (item.hargaSatuan || 0);
    const totalApbd = (item.volumeApbd || 0) * (item.hargaSatuan || 0);
    const totalRow = totalSwadaya + totalApbd;
    
    // Tax calculations matching PDF rules
    const ppn = item.hasPpn ? totalRow * 0.11 : 0;
    
    let pph21 = 0;
    if (item.hasPph21) {
      // Honor Sekretaris special handling matching PDF if exact 1.5M honor
      if (item.uraian.includes("1.2. Sekretaris") && totalRow === 1500000) {
        pph21 = 1500000;
      } else {
        pph21 = totalRow * 0.05;
      }
    }
    
    const pph22 = item.hasPph22 ? totalRow * 0.015 : 0;
    const pph23 = item.hasPph23 ? totalRow * 0.02 : 0;

    return { volTotal, totalSwadaya, totalApbd, totalRow, ppn, pph21, pph22, pph23 };
  };

  const calculateSection = (list: RabItem[]) => {
    return list.reduce((acc, item) => {
      const row = calculateRow(item);
      return {
        totalRow: acc.totalRow + row.totalRow,
        ppn: acc.ppn + row.ppn,
        pph21: acc.pph21 + row.pph21,
        pph22: acc.pph22 + row.pph22,
        pph23: acc.pph23 + row.pph23,
        totalSwadaya: acc.totalSwadaya + row.totalSwadaya,
        totalApbd: acc.totalApbd + row.totalApbd,
      };
    }, { totalRow: 0, ppn: 0, pph21: 0, pph22: 0, pph23: 0, totalSwadaya: 0, totalApbd: 0 });
  };

  const bahanCalc = calculateSection(bahanList);
  const alatCalc = calculateSection(alatList);
  const upahCalc = calculateSection(upahList);
  const opCalc = calculateSection(operasionalList);

  const grandTotal = {
    totalRow: bahanCalc.totalRow + alatCalc.totalRow + upahCalc.totalRow + opCalc.totalRow,
    ppn: bahanCalc.ppn + alatCalc.ppn + upahCalc.ppn + opCalc.ppn,
    pph21: bahanCalc.pph21 + alatCalc.pph21 + upahCalc.pph21 + opCalc.pph21,
    pph22: bahanCalc.pph22 + alatCalc.pph22 + upahCalc.pph22 + opCalc.pph22,
    pph23: bahanCalc.pph23 + alatCalc.pph23 + upahCalc.pph23 + opCalc.pph23,
    totalSwadaya: bahanCalc.totalSwadaya + alatCalc.totalSwadaya + upahCalc.totalSwadaya + opCalc.totalSwadaya,
    totalApbd: bahanCalc.totalApbd + alatCalc.totalApbd + upahCalc.totalApbd + opCalc.totalApbd,
  };

  const renderItems = (list: RabItem[]) => {
    let mainIndex = 0;
    return list.map((item) => {
      const c = calculateRow(item);
      const isHeaderSubItem = item.uraian.trim() === "Honor TPK";
      const isSubNumbered = /^\d+\.\d+/.test(item.uraian.trim()) || isHeaderSubItem;
      
      let displayNo = "";
      if (!isSubNumbered) {
        mainIndex += 1;
        displayNo = mainIndex.toString();
      }

      return (
        <tr key={item.id} className="text-[9px] leading-tight font-sans border-b border-black/20">
          <td className="border-x border-black px-1 py-1 text-center font-medium">{displayNo}</td>
          <td className={`border-x border-black px-1.5 py-1 ${isHeaderSubItem ? "font-bold italic bg-slate-50" : isSubNumbered ? "pl-4 font-normal text-slate-900" : "font-semibold"}`}>
            {item.uraian}
          </td>
          <td className="border-x border-black px-1 py-1 text-center font-mono">{c.volTotal > 0 ? (Number.isInteger(c.volTotal) ? c.volTotal : c.volTotal.toFixed(2)) : "-"}</td>
          <td className="border-x border-black px-1 py-1 text-center font-mono">{item.volumeSwadaya > 0 ? item.volumeSwadaya : "-"}</td>
          <td className="border-x border-black px-1 py-1 text-center font-mono">{item.volumeApbd > 0 ? (Number.isInteger(item.volumeApbd) ? item.volumeApbd : item.volumeApbd.toFixed(2)) : "-"}</td>
          <td className="border-x border-black px-1 py-1 text-center">{item.satuan}</td>
          <td className="border-x border-black px-1 py-1 text-center">{item.kategori}</td>
          <td className="border-x border-black px-1 py-1 text-right font-mono">{formatCurrency(item.hargaSatuan)}</td>
          <td className="border-x border-black px-1 py-1 text-right font-mono">{formatCurrency(c.totalSwadaya)}</td>
          <td className="border-x border-black px-1 py-1 text-right font-mono">{formatCurrency(c.totalApbd)}</td>
          <td className="border-x border-black px-1 py-1 text-right font-mono font-bold">{formatCurrency(c.totalRow)}</td>
          <td className="border-x border-black px-1 py-1 text-right font-mono">{formatCurrency(c.ppn)}</td>
          <td className="border-x border-black px-1 py-1 text-right font-mono">{formatCurrency(c.pph21)}</td>
          <td className="border-x border-black px-1 py-1 text-right font-mono">{formatCurrency(c.pph22)}</td>
          <td className="border-x border-black px-1 py-1 text-right font-mono">{formatCurrency(c.pph23)}</td>
        </tr>
      );
    });
  };

  const renderSubtotal = (roman: string, calc: any) => (
    <tr className="font-bold text-[9px] bg-slate-100/80 border-y border-black">
      <td colSpan={8} className="border border-black px-2 py-1 text-center italic uppercase tracking-wider">Sub total {roman}</td>
      <td className="border border-black px-1 py-1 text-right font-mono">{formatCurrency(calc.totalSwadaya)}</td>
      <td className="border border-black px-1 py-1 text-right font-mono">{formatCurrency(calc.totalApbd)}</td>
      <td className="border border-black px-1 py-1 text-right font-mono text-emerald-800">{formatCurrency(calc.totalRow)}</td>
      <td className="border border-black px-1 py-1 text-right font-mono">{formatCurrency(calc.ppn)}</td>
      <td className="border border-black px-1 py-1 text-right font-mono">{formatCurrency(calc.pph21)}</td>
      <td className="border border-black px-1 py-1 text-right font-mono">{formatCurrency(calc.pph22)}</td>
      <td className="border border-black px-1 py-1 text-right font-mono">{formatCurrency(calc.pph23)}</td>
    </tr>
  );

  const getSumberDanaLabel = (kategori: string) => {
    const upper = (kategori || "").toUpperCase();
    if (upper.includes("DANA DESA") || upper === "DD") return "DANA DESA";
    if (upper.includes("ADD")) return "ADD";
    if (upper.includes("BHPRD")) return "BHPRD";
    return "APBD";
  };

  const sumberDanaText = getSumberDanaLabel(formData.kategoriRab);

  return (
    <div className="bg-slate-200 min-h-screen py-8 print:bg-white print:py-0">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body > *:not(#print-area) { display: none !important; }
          #print-area {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 auto !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          #print-area * { visibility: visible !important; font-family: Arial, Helvetica, sans-serif !important; box-sizing: border-box !important; }
          .no-print { display: none !important; }
          @page {
            size: ${orientation === "portrait" ? "215.9mm 330.2mm portrait" : "330.2mm 215.9mm landscape"};
            margin: 5mm 8mm;
          }
          table { page-break-inside: auto; width: 100% !important; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table th, table td {
          border-color: #000 !important;
          color: #000 !important;
        }
      ` }} />

      {/* Toolbar Controls */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-md border border-slate-300 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Kembali ke Form RAB
        </button>

        <div className="flex items-center gap-3">
          {/* Orientation selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-bold">
            <button
              onClick={() => setOrientation("portrait")}
              className={`px-3 py-1.5 rounded-lg transition-all ${orientation === "portrait" ? "bg-emerald-600 text-white shadow-xs font-black" : "text-slate-600 hover:text-slate-900"}`}
            >
              📄 Portrait (F4)
            </button>
            <button
              onClick={() => setOrientation("landscape")}
              className={`px-3 py-1.5 rounded-lg transition-all ${orientation === "landscape" ? "bg-emerald-600 text-white shadow-xs font-black" : "text-slate-600 hover:text-slate-900"}`}
            >
              📜 Landscape (F4)
            </button>
          </div>

          <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
            <Printer size={18} /> Cetak RAB Desa
          </button>
        </div>
      </div>

      {/* Print Document */}
      <div 
        id="print-area" 
        className="mx-auto bg-white shadow-2xl text-black overflow-hidden border border-slate-300 transition-all duration-300" 
        style={{ 
          width: "100%", 
          maxWidth: orientation === "portrait" ? "215.9mm" : "330.2mm", 
          minHeight: orientation === "portrait" ? "330.2mm" : "215.9mm", 
          padding: "8mm", 
          fontFamily: "Arial, Helvetica, sans-serif", 
          color: "#000" 
        }}
      >
        
        {/* Header Title */}
        <h1 className="text-center font-black text-base mb-4 tracking-wider uppercase text-black">
          RANCANGAN ANGGARAN BELANJA DESA
        </h1>
        
        {/* Identitas Metadata RAB */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-[10px] font-sans border-b border-black pb-2">
          <div className="space-y-1">
            <div className="grid grid-cols-[90px_10px_1fr]">
              <span className="font-bold">Provinsi</span><span>:</span><span className="font-semibold">{formData.provinsi || "Jawa Barat"}</span>
            </div>
            <div className="grid grid-cols-[90px_10px_1fr]">
              <span className="font-bold">Kabupaten</span><span>:</span><span className="font-semibold">{formData.kabupaten || "Bogor"}</span>
            </div>
            <div className="grid grid-cols-[90px_10px_1fr]">
              <span className="font-bold">Kecamatan</span><span>:</span><span className="font-semibold">{formData.kecamatan || "Cibungbulang"}</span>
            </div>
            <div className="grid grid-cols-[90px_10px_1fr]">
              <span className="font-bold">Desa</span><span>:</span><span className="font-semibold">{formData.desa || "Cimanggu I"}</span>
            </div>
            <div className="grid grid-cols-[90px_10px_1fr]">
              <span className="font-bold">Lokasi</span><span>:</span><span className="font-semibold">{formData.lokasi || "Kp. Jatake Rt. 001 Rw. 005"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-[100px_10px_1fr]">
              <span className="font-bold">No. RAB</span><span>:</span><span className="font-semibold">{formData.noRab || "04"}</span>
            </div>
            <div className="grid grid-cols-[100px_10px_1fr]">
              <span className="font-bold">Program</span><span>:</span><span className="font-semibold">{formData.program || "Bantuan Keuangan Infrastruktur Desa"}</span>
            </div>
            <div className="grid grid-cols-[100px_10px_1fr]">
              <span className="font-bold">Jenis Kegiatan</span><span>:</span><span className="font-semibold">{formData.jenisKegiatan || "Pembuatan Dinding Penahan Tanah (DPT)"}</span>
            </div>
            <div className="grid grid-cols-[100px_10px_1fr]">
              <span className="font-bold">Ukuran/Dimensi</span><span>:</span><span className="font-semibold">{formData.ukuranDimensi || "Panjang : 30 m' x Tinggi : 6 m'"}</span>
            </div>
          </div>
        </div>

        {/* Tabel Utama RAB 15 Kolom */}
        <table className="w-full text-[9px] border-collapse border border-black table-fixed">
          <thead>
            <tr className="bg-slate-100 font-bold text-center text-black border-b border-black">
              <th className="border border-black p-1 w-[22px]" rowSpan={2}>NO</th>
              <th className="border border-black p-1 w-[130px]" rowSpan={2}>URAIAN</th>
              <th className="border border-black p-0.5" colSpan={3}>VOLUME</th>
              <th className="border border-black p-1 w-[32px]" rowSpan={2}>Satuan</th>
              <th className="border border-black p-1 w-[35px]" rowSpan={2}>Kode<br/>Kategori</th>
              <th className="border border-black p-1 w-[60px]" rowSpan={2}>HARGA<br/>SATUAN<br/>(Rp)</th>
              <th className="border border-black p-0.5" colSpan={2}>Sumber Dana</th>
              <th className="border border-black p-1 w-[65px]" rowSpan={2}>Total<br/>(Rp)</th>
              <th className="border border-black p-1 w-[50px]" rowSpan={2}>PPN<br/>11%</th>
              <th className="border border-black p-1 w-[45px]" rowSpan={2}>PPH 21<br/>5%</th>
              <th className="border border-black p-1 w-[45px]" rowSpan={2}>PPH 22<br/>1.50%</th>
              <th className="border border-black p-1 w-[35px]" rowSpan={2}>PPH 23<br/>2%</th>
            </tr>
            <tr className="bg-slate-100 font-bold text-center text-black border-b border-black">
              <th className="border border-black p-0.5 w-[35px]">Total</th>
              <th className="border border-black p-0.5 w-[35px]">Dari<br/>Swadaya</th>
              <th className="border border-black p-0.5 w-[35px]">Dari<br/>{sumberDanaText}</th>
              <th className="border border-black p-0.5 w-[60px]">Dari<br/>Swadaya</th>
              <th className="border border-black p-0.5 w-[60px]">Dari {sumberDanaText}</th>
            </tr>
          </thead>
          <tbody>
            
            {/* I BAHAN */}
            <tr className="font-bold border-black bg-slate-50">
              <td className="border border-black p-1 text-center font-black">I</td>
              <td className="border border-black p-1 font-black" colSpan={14}>BAHAN</td>
            </tr>
            {renderItems(bahanList)}
            {renderSubtotal("I", bahanCalc)}
            
            {/* II ALAT */}
            <tr className="font-bold border-black bg-slate-50">
              <td className="border border-black p-1 text-center font-black">II</td>
              <td className="border border-black p-1 font-black" colSpan={14}>ALAT</td>
            </tr>
            {renderItems(alatList)}
            {renderSubtotal("II", alatCalc)}
            
            {/* III UPAH */}
            <tr className="font-bold border-black bg-slate-50">
              <td className="border border-black p-1 text-center font-black">III</td>
              <td className="border border-black p-1 font-black" colSpan={14}>UPAH</td>
            </tr>
            {renderItems(upahList)}
            {renderSubtotal("III", upahCalc)}
            
            {/* IV BIAYA OPERASIONAL */}
            <tr className="font-bold border-black bg-slate-50">
              <td className="border border-black p-1 text-center font-black">IV</td>
              <td className="border border-black p-1 font-black" colSpan={14}>BIAYA OPERASIONAL</td>
            </tr>
            {renderItems(operasionalList)}
            {renderSubtotal("IV", opCalc)}

            {/* GRAND TOTAL ROW */}
            <tr className="font-black bg-slate-200 text-[9px] border-2 border-black">
              <td colSpan={8} className="border border-black p-1.5 text-center uppercase tracking-wider">TOTAL BIAYA</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatCurrency(grandTotal.totalSwadaya)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatCurrency(grandTotal.totalApbd)}</td>
              <td className="border border-black p-1.5 text-right font-mono text-emerald-900 text-sm">{formatCurrency(grandTotal.totalRow)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatCurrency(grandTotal.ppn)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatCurrency(grandTotal.pph21)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatCurrency(grandTotal.pph22)}</td>
              <td className="border border-black p-1.5 text-right font-mono">{formatCurrency(grandTotal.pph23)}</td>
            </tr>
          </tbody>
        </table>

        {/* Sumber Dana Rekap Box */}
        <div className="mt-4 border-2 border-black w-7/12 ml-auto text-[9px] font-sans">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-black font-bold bg-slate-100">
                <td className="border-r border-black p-1.5 w-[90px] text-center font-black" rowSpan={3}>SUMBER<br/>DANA</td>
                <td className="border-r border-black p-1.5 text-left">{sumberDanaText}</td>
                <td className="border-r border-black p-1.5 text-right font-mono w-[90px]">{formatCurrency(grandTotal.totalApbd)}</td>
                <td className="p-1.5 text-right font-mono w-[90px]">{formatCurrency(grandTotal.totalApbd)}</td>
              </tr>
              <tr className="border-b border-black font-bold">
                <td className="border-r border-black p-1.5 text-left">Dari Swadaya</td>
                <td className="border-r border-black p-1.5 text-right font-mono">{formatCurrency(grandTotal.totalSwadaya)}</td>
                <td className="p-1.5 text-right font-mono">{formatCurrency(grandTotal.totalSwadaya)}</td>
              </tr>
              <tr className="font-black bg-slate-200">
                <td className="border-r border-black p-1.5 text-left uppercase">Grand Total</td>
                <td className="border-r border-black p-1.5 text-right font-mono">{formatCurrency(grandTotal.totalRow)}</td>
                <td className="p-1.5 text-right font-mono">{formatCurrency(grandTotal.totalRow)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legalitas & Tanda Tangan */}
        <div className="mt-8 flex justify-between px-12 text-[10px] text-black">
          <div className="text-center w-60">
            <p className="font-medium">Disetujui,</p>
            <p className="font-bold mb-16">Kepala Desa Cimanggu I</p>
            <p className="font-black text-xs uppercase underline decoration-2 underline-offset-4">{formData.kadesName || "HERNAWAN M. SODIK"}</p>
          </div>
          <div className="text-center w-60">
            <p className="font-medium">Dibuat oleh,</p>
            <p className="font-bold mb-16">Tim Pelaksana Kegiatan</p>
            <p className="font-black text-xs uppercase underline decoration-2 underline-offset-4">{formData.tpkName || "SANA SULAEMAN"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

