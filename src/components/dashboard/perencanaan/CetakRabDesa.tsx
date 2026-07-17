"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    // window.print();
  }, []);

  const formatCurrency = (val: number) => {
    if (val === 0) return "-";
    return val.toLocaleString("en-US");
  };

  const calculateRow = (item: RabItem) => {
    const volTotal = item.volumeSwadaya + item.volumeApbd;
    const totalSwadaya = item.volumeSwadaya * item.hargaSatuan;
    const totalApbd = item.volumeApbd * item.hargaSatuan;
    const totalRow = totalSwadaya + totalApbd;
    
    const ppn = item.hasPpn ? totalRow * 0.11 : 0;
    const pph21 = item.hasPph21 ? totalRow * 0.05 : 0;
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
    return list.map((item, idx) => {
      const c = calculateRow(item);
      return (
        <tr key={item.id} className="text-[10px]">
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-center">{idx + 1}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 truncate max-w-[150px]">{item.uraian}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-center font-mono">{c.volTotal > 0 ? c.volTotal.toFixed(2) : "-"}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-center font-mono">{item.volumeSwadaya > 0 ? item.volumeSwadaya.toFixed(2) : "-"}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-center font-mono">{item.volumeApbd > 0 ? item.volumeApbd.toFixed(2) : "-"}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-center">{item.satuan}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-center">{item.kategori}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-right font-mono">{formatCurrency(item.hargaSatuan)}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-right font-mono">{formatCurrency(c.totalSwadaya)}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-right font-mono">{formatCurrency(c.totalApbd)}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-right font-mono">{formatCurrency(c.totalRow)}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-right font-mono">{formatCurrency(c.ppn)}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-right font-mono">{formatCurrency(c.pph21)}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-right font-mono">{formatCurrency(c.pph22)}</td>
          <td className="border-x border-black border-b border-dotted px-1 py-0.5 text-right font-mono">{formatCurrency(c.pph23)}</td>
        </tr>
      );
    });
  };

  const renderSubtotal = (roman: string, calc: any) => (
    <tr className="font-bold text-[10px]">
      <td colSpan={8} className="border border-black px-1 py-0.5 text-center italic">Sub total {roman}</td>
      <td className="border border-black px-1 py-0.5 text-right font-mono">{formatCurrency(calc.totalSwadaya)}</td>
      <td className="border border-black px-1 py-0.5 text-right font-mono">{formatCurrency(calc.totalApbd)}</td>
      <td className="border border-black px-1 py-0.5 text-right font-mono">{formatCurrency(calc.totalRow)}</td>
      <td className="border border-black px-1 py-0.5 text-right font-mono">{formatCurrency(calc.ppn)}</td>
      <td className="border border-black px-1 py-0.5 text-right font-mono">{formatCurrency(calc.pph21)}</td>
      <td className="border border-black px-1 py-0.5 text-right font-mono">{formatCurrency(calc.pph22)}</td>
      <td className="border border-black px-1 py-0.5 text-right font-mono">{formatCurrency(calc.pph23)}</td>
    </tr>
  );

  return (
    <div className="bg-slate-100 min-h-screen py-8">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print { display: none !important; }
          @page {
            size: 330.2mm 215.9mm landscape; /* F4 Landscape */
            margin: 10mm;
          }
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table th, table td {
          border-color: #000 !important;
          color: #000 !important;
        }
      `}} />

      {/* Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft size={18} /> Kembali
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
          <Printer size={18} /> Cetak RAB (F4 Landscape)
        </button>
      </div>

      {/* Print Document - Landscape Layout */}
      <div id="print-area" className="mx-auto bg-white shadow-xl text-black font-serif overflow-hidden" style={{ width: "100%", maxWidth: "330.2mm", minHeight: "215.9mm", padding: "10mm", fontFamily: "'Times New Roman', Times, serif", color: "#000" }}>
        
        {/* Header Title */}
        <h1 className="text-center font-bold text-[14px] mb-4 tracking-wide text-black">RANCANGAN ANGGARAN BELANJA DESA</h1>
        
        {/* Identitas RAB */}
        <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
          <div className="grid grid-cols-[80px_10px_1fr] gap-0">
            <div>Provinsi</div><div>:</div><div>Jawa Barat</div>
            <div>Kabupaten</div><div>:</div><div>Bogor</div>
            <div>Kecamatan</div><div>:</div><div>Cibungbulang</div>
            <div>Desa</div><div>:</div><div>Cimanggu I</div>
            <div>Lokasi</div><div>:</div><div>{formData.lokasi}</div>
          </div>
          <div className="grid grid-cols-[80px_10px_1fr] gap-0">
            <div>No. RAB</div><div>:</div><div>{formData.noRab}</div>
            <div>Program</div><div>:</div><div>{formData.program}</div>
            <div>Jenis Kegiatan</div><div>:</div><div>{formData.jenisKegiatan}</div>
            <div>Ukuran/Dimensi</div><div>:</div><div>{formData.ukuranDimensi}</div>
          </div>
        </div>

        {/* Tabel RAB */}
        <table className="w-full text-[9px] border-collapse border border-black table-fixed">
          <thead>
            <tr className="bg-white font-bold text-center">
              <td className="border border-black p-0.5 w-[25px]" rowSpan={2}>NO</td>
              <td className="border border-black p-0.5 w-[140px]" rowSpan={2}>URAIAN</td>
              <td className="border border-black p-0.5" colSpan={3}>VOLUME</td>
              <td className="border border-black p-0.5 w-[40px]" rowSpan={2}>Satuan</td>
              <td className="border border-black p-0.5 w-[40px]" rowSpan={2}>Kode<br/>Kategori</td>
              <td className="border border-black p-0.5 w-[65px]" rowSpan={2}>HARGA<br/>SATUAN<br/>(Rp)</td>
              <td className="border border-black p-0.5" colSpan={2}>Sumber Dana</td>
              <td className="border border-black p-0.5 w-[75px]" rowSpan={2}>Total<br/>(Rp)</td>
              <td className="border border-black p-0.5 w-[55px]" rowSpan={2}>PPN<br/>11%</td>
              <td className="border border-black p-0.5 w-[55px]" rowSpan={2}>PPH 21<br/>5%</td>
              <td className="border border-black p-0.5 w-[50px]" rowSpan={2}>PPH 22<br/>1.50%</td>
              <td className="border border-black p-0.5 w-[45px]" rowSpan={2}>PPH 23<br/>2%</td>
            </tr>
            <tr className="bg-white font-bold text-center">
              <td className="border border-black p-0.5 w-[40px]">Total</td>
              <td className="border border-black p-0.5 w-[40px]">Dari<br/>Swadaya</td>
              <td className="border border-black p-0.5 w-[40px]">Dari<br/>APBD</td>
              <td className="border border-black p-0.5 w-[65px]">Dari<br/>Swadaya</td>
              <td className="border border-black p-0.5 w-[65px]">Dari APBD</td>
            </tr>
          </thead>
          <tbody>
            
            {/* I BAHAN */}
            <tr className="font-bold border-black">
              <td className="border-x border-black border-b border-dotted p-0.5 text-center">I</td>
              <td className="border-x border-black border-b border-dotted p-0.5" colSpan={14}>BAHAN</td>
            </tr>
            {renderItems(bahanList)}
            {renderSubtotal("I", bahanCalc)}
            
            {/* II ALAT */}
            <tr className="font-bold bg-white">
              <td colSpan={15} className="p-0 border border-black"><div className="h-[2px]"></div></td>
            </tr>
            <tr className="font-bold border-black">
              <td className="border-x border-black border-b border-dotted p-0.5 text-center">II</td>
              <td className="border-x border-black border-b border-dotted p-0.5" colSpan={14}>ALAT</td>
            </tr>
            {renderItems(alatList)}
            {renderSubtotal("II", alatCalc)}
            
            {/* III UPAH */}
            <tr className="font-bold bg-white">
              <td colSpan={15} className="p-0 border border-black"><div className="h-[2px]"></div></td>
            </tr>
            <tr className="font-bold border-black">
              <td className="border-x border-black border-b border-dotted p-0.5 text-center">III</td>
              <td className="border-x border-black border-b border-dotted p-0.5" colSpan={14}>UPAH</td>
            </tr>
            {renderItems(upahList)}
            {renderSubtotal("III", upahCalc)}
            
            {/* IV OPERASIONAL */}
            <tr className="font-bold bg-white">
              <td colSpan={15} className="p-0 border border-black"><div className="h-[2px]"></div></td>
            </tr>
            <tr className="font-bold border-black">
              <td className="border-x border-black border-b border-dotted p-0.5 text-center">IV</td>
              <td className="border-x border-black border-b border-dotted p-0.5" colSpan={14}>BIAYA OPERASIONAL</td>
            </tr>
            {renderItems(operasionalList)}
            {renderSubtotal("IV", opCalc)}

            {/* GRAND TOTAL */}
            <tr className="font-bold bg-white text-[10px]">
              <td colSpan={8} className="border border-black p-1 text-center uppercase">TOTAL BIAYA</td>
              <td className="border border-black p-1 text-right font-mono">{formatCurrency(grandTotal.totalSwadaya)}</td>
              <td className="border border-black p-1 text-right font-mono">{formatCurrency(grandTotal.totalApbd)}</td>
              <td className="border border-black p-1 text-right font-mono">{formatCurrency(grandTotal.totalRow)}</td>
              <td className="border border-black p-1 text-right font-mono">{formatCurrency(grandTotal.ppn)}</td>
              <td className="border border-black p-1 text-right font-mono">{formatCurrency(grandTotal.pph21)}</td>
              <td className="border border-black p-1 text-right font-mono">{formatCurrency(grandTotal.pph22)}</td>
              <td className="border border-black p-1 text-right font-mono">{formatCurrency(grandTotal.pph23)}</td>
            </tr>
          </tbody>
        </table>

        {/* Sumber Dana Rekap */}
        <div className="mt-2 border border-black w-5/12 ml-auto text-[10px]">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-black font-bold">
                <td className="border-r border-black p-1 w-1/3 text-center" rowSpan={3}>SUMBER<br/>DANA</td>
                <td className="border-r border-black p-1 text-center">APBD</td>
                <td className="border-r border-black p-1 text-right font-mono w-[80px]">{formatCurrency(grandTotal.totalApbd)}</td>
                <td className="p-1 text-right font-mono w-[80px]">{formatCurrency(grandTotal.totalApbd)}</td>
              </tr>
              <tr className="border-b border-black font-bold">
                <td className="border-r border-black p-1 text-center">Dari Swadaya</td>
                <td className="border-r border-black p-1 text-right font-mono">{formatCurrency(grandTotal.totalSwadaya)}</td>
                <td className="p-1 text-right font-mono">{formatCurrency(grandTotal.totalSwadaya)}</td>
              </tr>
              <tr className="font-bold bg-white">
                <td className="border-r border-black p-1 text-center">Grand Total</td>
                <td className="border-r border-black p-1 text-right font-mono">{formatCurrency(grandTotal.totalRow)}</td>
                <td className="p-1 text-right font-mono">{formatCurrency(grandTotal.totalRow)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-6 flex justify-between px-10 text-[11px] text-black">
          <div className="text-center">
            <p>Disetujui,</p>
            <p className="mb-16">Kepala Desa Cimanggu I</p>
            <p className="font-bold underline uppercase text-black">{formData.kadesName}</p>
          </div>
          <div className="text-center">
            <p>Dibuat oleh,</p>
            <p className="mb-16">Tim Pelaksana Kegiatan</p>
            <p className="font-bold underline uppercase text-black">{formData.tpkName}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
