"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";

export interface CetakTosDptProps {
  metaKabupaten: string;
  metaKecamatan: string;
  metaDesa: string;
  metaLokasi: string;
  metaPelaksana: string;
  metaKades: string;
  metaTanggal: string;
  dptP: number;
  dptT: number;
  dptJarakTiang: number;
  dptTiang: number;
  dptTrap: number;
  dptLg: number;
  dptDg: number;
  dptLt: number;
  onBack: () => void;
}

export function CetakTosDpt({
  metaKabupaten,
  metaKecamatan,
  metaDesa,
  metaLokasi,
  metaPelaksana,
  metaKades,
  metaTanggal,
  dptP,
  dptT,
  dptJarakTiang,
  dptTiang,
  dptTrap,
  dptLg,
  dptDg,
  dptLt,
  onBack
}: CetakTosDptProps) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  useEffect(() => {
    // Optional auto print trigger
  }, []);

  const scaleFactor = (dptP / 30) * (dptT / 6);
  const tiangRatio = dptTiang / 15;

  // 1. PEMBESIAN
  const bSloofVertKg = 328.205 * (dptT / 6) * tiangRatio;
  const bSloofVertBtg = Math.ceil(bSloofVertKg / 10.65);

  const bSloofHorizKg = 369 * (dptP / 30) * tiangRatio;
  const bSloofHorizBtg = Math.ceil(bSloofHorizKg / 4.735);

  const bVertTrapKg = 214.257 * (dptT / 6) * (dptTrap / 2) * tiangRatio;
  const bVertTrapBtg = Math.ceil(bVertTrapKg / 10.65);

  const bHorizTrapKg = 181 * (dptP / 30) * (dptTrap / 2) * tiangRatio;
  const bHorizTrapBtg = Math.ceil(bHorizTrapKg / 4.735);

  const bCakar1Kg = 208.858 * tiangRatio;
  const bCakar1Btg = Math.ceil(bCakar1Kg / 10.65);

  const bCakar2Kg = 421.98 * tiangRatio;
  const bCakar2Btg = Math.ceil(bCakar2Kg / 10.65);

  const bCakar3Kg = 230.17 * tiangRatio;
  const bCakar3Btg = Math.ceil(bCakar3Kg / 10.65);

  const totalBesiKg = bSloofVertKg + bSloofHorizKg + bVertTrapKg + bHorizTrapKg + bCakar1Kg + bCakar2Kg + bCakar3Kg;
  const totalBesiTon = totalBesiKg / 1000;

  const hokBesiPekerja = Math.round((totalBesiTon * 1000 * 0.1050) / 7);
  const hokBesiTukang = Math.round((totalBesiTon * 1000 * 0.0350) / 7);
  const hokBesiMandor = Math.round((totalBesiTon * 1000 * 0.0350) / 7);

  // 2. PASANGAN BATU
  const seg1 = 1.70 * 2.70 * 0.50 * dptTiang * (scaleFactor / tiangRatio);
  const seg2 = 1.70 * 2.85 * 0.70 * dptTiang * (scaleFactor / tiangRatio);
  const seg3 = 0.70 * 0.40 * dptTiang * (scaleFactor / tiangRatio);
  const volPasBatu = seg1 + seg2 + seg3;

  const matBatuBelah = 1.17 * volPasBatu;
  const matSemenPas = (176.00 * volPasBatu) / 50; // Zak
  const matPasirPas = 0.509 * volPasBatu;

  const hokPasPekerja = Math.round((matBatuBelah * 5.4618) / 7);
  const hokPasTukang = Math.round((matBatuBelah * 1.3655) / 7);
  const hokPasMandor = Math.round((matBatuBelah * 0.6827) / 7);

  // 3. PIPA PVC SULINGAN
  const pvc3m = Math.round(23 * scaleFactor);
  const pvc4m = Math.round(4 * scaleFactor);
  const btgPipaPvc = pvc3m + pvc4m;

  // 4. GALIAN PONDASI
  const volGalian = dptP * dptLg * dptDg;
  const hokGalPekerja = Math.max(1, Math.round((volGalian * 0.0139) / 7));
  const hokGalMandor = Math.max(1, Math.round((volGalian * 0.0069) / 7));

  // 5. PAPAN COR / BEKISTING
  const papanCor = Math.ceil(6 * scaleFactor);

  // 6. BETON K-250 (MANUAL)
  const volBetonVert = 13.50 * (dptT / 6) * tiangRatio;
  const volBetonHoriz = 9.00 * (dptP / 30);
  const volBetonCakarAlas = 10.50 * tiangRatio;
  const volBetonCakarTrap = 5.63 * tiangRatio;
  const volBetonTotal = volBetonVert + volBetonHoriz + volBetonCakarAlas + volBetonCakarTrap;

  const matBatuPecah = 0.769 * volBetonTotal;
  const matSemenBeton = (384.00 * volBetonTotal) / 50;
  const matPasirBeton = 0.494 * volBetonTotal;

  const hokBtnPekerja = Math.round((volBetonTotal * 4.2170) / 7);
  const hokBtnTukang = Math.round((volBetonTotal * 0.6020) / 7);
  const hokBtnMandor = Math.round((volBetonTotal * 0.6020) / 7);

  // 7. TIMBUNAN TANAH
  const volTimbunan = dptP * dptLt * dptT;
  const hokTmbPekerja = Math.max(1, Math.round((volTimbunan * 0.0278) / 7));
  const hokTmbTukang = Math.max(1, Math.round((volTimbunan * 0.0069) / 7));

  return (
    <div className="bg-slate-200 min-h-screen py-8 print:bg-white print:py-0">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body > *:not(#print-tos-area) { display: none !important; }
          #print-tos-area {
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
          #print-tos-area * { visibility: visible !important; font-family: Arial, Helvetica, sans-serif !important; box-sizing: border-box !important; }
          .no-print { display: none !important; }
          @page {
            size: ${orientation === "portrait" ? "215.9mm 330.2mm portrait" : "330.2mm 215.9mm landscape"};
            margin: 5mm 8mm;
          }
          table { page-break-inside: auto; width: 100% !important; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      ` }} />

      {/* Toolbar Controls */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-md border border-slate-300 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Kembali ke Kalkulator TOS
        </button>

        <div className="flex items-center gap-3">
          {/* Orientation selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 text-xs font-bold">
            <button
              onClick={() => setOrientation("portrait")}
              className={`px-3 py-1.5 rounded-lg transition-all ${orientation === "portrait" ? "bg-amber-500 text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"}`}
            >
              📄 Portrait (F4)
            </button>
            <button
              onClick={() => setOrientation("landscape")}
              className={`px-3 py-1.5 rounded-lg transition-all ${orientation === "landscape" ? "bg-amber-500 text-slate-950 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"}`}
            >
              📜 Landscape (F4)
            </button>
          </div>

          <button onClick={() => window.print()} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl font-black transition-all shadow-sm">
            <Printer size={18} /> Cetak Lembar TOS
          </button>
        </div>
      </div>

      {/* Print Document */}
      <div 
        id="print-tos-area" 
        className="mx-auto bg-white shadow-2xl text-black overflow-hidden border border-slate-300 space-y-4 transition-all duration-300" 
        style={{ 
          width: "100%", 
          maxWidth: orientation === "portrait" ? "215.9mm" : "330.2mm", 
          minHeight: orientation === "portrait" ? "330.2mm" : "215.9mm", 
          padding: "8mm", 
          fontFamily: "Arial, Helvetica, sans-serif", 
          fontSize: "11px", 
          color: "#000" 
        }}
      >
        
        {/* HEADER TABLE */}
        <div className="border border-black font-sans text-[11px]">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-black">
                <td className="p-1.5 font-bold w-1/6 bg-slate-100 border-r border-black">Kabupaten</td>
                <td className="p-1.5 border-r border-black w-1/3 uppercase font-semibold">: {metaKabupaten}</td>
                <td className="p-1.5 font-bold w-1/6 bg-slate-100 border-r border-black">Lembar Perhitungan</td>
                <td className="p-1.5 font-bold w-1/3 border-r border-black">Jenis Prasarana : Pembuatan Dinding Penahan Tanah (DPT)</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-1.5 font-bold bg-slate-100 border-r border-black">Kecamatan</td>
                <td className="p-1.5 border-r border-black uppercase font-semibold">: {metaKecamatan}</td>
                <td className="p-1.5 font-bold text-center border-r border-black" rowSpan={2}>
                  <div className="text-sm font-black tracking-wider uppercase">Take Of Sheet</div>
                </td>
                <td className="p-1.5 border-r border-black">Lokasi : {metaLokasi}</td>
              </tr>
              <tr>
                <td className="p-1.5 font-bold bg-slate-100 border-r border-black">Desa</td>
                <td className="p-1.5 border-r border-black uppercase font-semibold">: {metaDesa}</td>
                <td className="p-1.5 font-bold border-r border-black">Volume DPT : Panjang : {dptP} m' | Tinggi : {dptT} m'</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 1: PEMBESIAN */}
        <div className="border border-black p-3 space-y-2">
          <h3 className="font-black text-xs uppercase underline">PEMBESIAN</h3>
          <div className="space-y-1 font-mono text-[10px]">
            <div className="grid grid-cols-12 gap-1 font-bold text-black border-b border-black pb-1">
              <span className="col-span-3">Sloof Vertikal</span>
              <span className="col-span-1 text-center">Tiang</span>
              <span className="col-span-1 text-center">Bj</span>
              <span className="col-span-2 text-center">Kg</span>
              <span className="col-span-3 text-center">Bj x 1.2</span>
              <span className="col-span-2 text-right">Hasil</span>
            </div>

            <div className="grid grid-cols-12 gap-1 py-0.5 border-b border-dotted border-slate-300">
              <span className="col-span-3">4 Ø 12</span>
              <span className="col-span-1 text-center">24,00 + 0,64 = 24.64</span>
              <span className="col-span-1 text-center">{dptTiang}</span>
              <span className="col-span-2 text-center">0,888</span>
              <span className="col-span-3 text-center">= {bSloofVertKg.toFixed(3)} : 10,65</span>
              <span className="col-span-2 text-right font-bold">{bSloofVertBtg} Batang</span>
            </div>

            <div className="grid grid-cols-12 gap-1 py-0.5 border-b border-dotted border-slate-300">
              <span className="col-span-3">Sloof Horizontal (Ø 8 -20)</span>
              <span className="col-span-1 text-center">1.52m</span>
              <span className="col-span-1 text-center">41</span>
              <span className="col-span-2 text-center">{dptTiang}</span>
              <span className="col-span-3 text-center">= 935 x 0.3946 = {bSloofHorizKg.toFixed(0)} : 4.735</span>
              <span className="col-span-2 text-right font-bold">{bSloofHorizBtg} Batang</span>
            </div>

            <div className="grid grid-cols-12 gap-1 py-0.5 border-b border-dotted border-slate-300">
              <span className="col-span-3">Sloof Vertikal Trap (4 Ø 12)</span>
              <span className="col-span-1 text-center">120,64</span>
              <span className="col-span-1 text-center">{dptTrap}</span>
              <span className="col-span-2 text-center">0,888</span>
              <span className="col-span-3 text-center">= {bVertTrapKg.toFixed(3)} : 10,65</span>
              <span className="col-span-2 text-right font-bold">{bVertTrapBtg} Batang</span>
            </div>

            <div className="grid grid-cols-12 gap-1 py-0.5 border-b border-dotted border-slate-300">
              <span className="col-span-3">Sloof Horizontal Trap (Ø 8 -20)</span>
              <span className="col-span-1 text-center">1.52m</span>
              <span className="col-span-1 text-center">151</span>
              <span className="col-span-2 text-center">{dptTrap}</span>
              <span className="col-span-3 text-center">= 459 x 0.3946 = {bHorizTrapKg.toFixed(0)} : 4.735</span>
              <span className="col-span-2 text-right font-bold">{bHorizTrapBtg} Batang</span>
            </div>

            <div className="grid grid-cols-12 gap-1 py-0.5 border-b border-dotted border-slate-300">
              <span className="col-span-3">Cakar Ayam Ø 12 (Set 1)</span>
              <span className="col-span-1 text-center">3,92m</span>
              <span className="col-span-1 text-center">4</span>
              <span className="col-span-2 text-center">{dptTiang}</span>
              <span className="col-span-3 text-center">= {bCakar1Kg.toFixed(3)} : 10,65</span>
              <span className="col-span-2 text-right font-bold">{bCakar1Btg} Batang</span>
            </div>

            <div className="grid grid-cols-12 gap-1 py-0.5 border-b border-dotted border-slate-300">
              <span className="col-span-3">Cakar Ayam Ø 12 (Set 2)</span>
              <span className="col-span-1 text-center">3,96m</span>
              <span className="col-span-1 text-center">8</span>
              <span className="col-span-2 text-center">{dptTiang}</span>
              <span className="col-span-3 text-center">= {bCakar2Kg.toFixed(3)} : 10,65</span>
              <span className="col-span-2 text-right font-bold">{bCakar2Btg} Batang</span>
            </div>

            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-3">Cakar Ayam Ø 12 (Set 3)</span>
              <span className="col-span-1 text-center">4,32m</span>
              <span className="col-span-1 text-center">4</span>
              <span className="col-span-2 text-center">{dptTiang}</span>
              <span className="col-span-3 text-center">= {bCakar3Kg.toFixed(3)} : 10,65</span>
              <span className="col-span-2 text-right font-bold">{bCakar3Btg} Batang</span>
            </div>
          </div>

          <div className="pt-2 border-t border-black text-[10px] space-y-0.5 font-mono">
            <div className="font-bold uppercase">Pekerjaan Pembesian (HOK) = Total {totalBesiKg.toFixed(1)} Kg</div>
            <div>Pekerja = {totalBesiKg.toFixed(1)} x 0,1050 = {(totalBesiKg * 0.1050).toFixed(2)} jam : 7 = <strong>{hokBesiPekerja} HOK</strong></div>
            <div>Tukang = {totalBesiKg.toFixed(1)} x 0,0350 = {(totalBesiKg * 0.0350).toFixed(2)} jam : 7 = <strong>{hokBesiTukang} HOK</strong></div>
            <div>Mandor = {totalBesiKg.toFixed(1)} x 0,0350 = {(totalBesiKg * 0.0350).toFixed(2)} jam : 7 = <strong>{hokBesiMandor} HOK</strong></div>
          </div>
        </div>

        {/* SECTION 2: PASANGAN BATU */}
        <div className="border border-black p-3 space-y-2">
          <h3 className="font-black text-xs uppercase underline">PASANGAN BATU</h3>
          <div className="text-[10px] font-mono space-y-1">
            <div>1.70 x 2.70 x 0.50 x {dptTiang + 1} = {seg1.toFixed(2)} m³</div>
            <div>1.70 x 2.85 x 0.70 x {dptTiang + 1} = {seg2.toFixed(2)} m³</div>
            <div>0.70 x 0.40 x {dptTiang + 1} = {seg3.toFixed(2)} m³</div>
            <div className="font-bold border-t border-black pt-0.5">Total Volume Pasangan Batu = {volPasBatu.toFixed(2)} M3</div>

            <div className="pt-1">Batu Belah : 1.17 x {volPasBatu.toFixed(2)} = <strong>{matBatuBelah.toFixed(2)} M3</strong></div>
            <div>Semen PC (50 Kg) : 176.00 x {volPasBatu.toFixed(2)} = <strong>{Math.round(matSemenPas)} Zak</strong></div>
            <div>Pasir Pasang : 0.509 x {volPasBatu.toFixed(2)} = <strong>{matPasirPas.toFixed(2)} M3</strong></div>

            <div className="pt-1 font-bold border-t border-dotted border-slate-400">Pekerjaan DPT (HOK Pasangan Batu) :</div>
            <div>Pekerja = {matBatuBelah.toFixed(2)} x 5,4618 = {(matBatuBelah * 5.4618).toFixed(2)} jam : 7 = <strong>{hokPasPekerja} HOK</strong></div>
            <div>Tukang = {matBatuBelah.toFixed(2)} x 1,3655 = {(matBatuBelah * 1.3655).toFixed(2)} jam : 7 = <strong>{hokPasTukang} HOK</strong></div>
            <div>Mandor = {matBatuBelah.toFixed(2)} x 0,6827 = {(matBatuBelah * 0.6827).toFixed(2)} jam : 7 = <strong>{hokPasMandor} HOK</strong></div>
          </div>
        </div>

        {/* SECTION 3: PIPA PVC */}
        <div className="border border-black p-3 text-[10px] font-mono space-y-0.5">
          <h3 className="font-black text-xs uppercase underline font-sans mb-1">PIPA PVC SULINGAN AIR</h3>
          <div>Pipa PVC 2" (3m) = 3,00 x 123,00 x 0,75 : 12 = {pvc3m} Batang</div>
          <div>Pipa PVC 2" (4m) = 4,00 x 16,00 x 0,75 : 12 = {pvc4m} Batang</div>
          <div className="font-bold border-t border-black pt-0.5">Total Pipa PVC 2" = {btgPipaPvc} Batang</div>
        </div>

        {/* SECTION 4: GALIAN PONDASI */}
        <div className="border border-black p-3 text-[10px] font-mono space-y-0.5">
          <h3 className="font-black text-xs uppercase underline font-sans mb-1">GALIAN PONDASI</h3>
          <div>{dptP.toFixed(2)} x {dptLg.toFixed(2)} x {dptDg.toFixed(2)} = <strong>{volGalian.toFixed(2)} M3</strong></div>
          <div>Pekerja = {volGalian.toFixed(2)} x 0,0139 = 0,29 : 7 = <strong>{hokGalPekerja} HOK</strong></div>
          <div>Mandor = {volGalian.toFixed(2)} x 0,0069 = 0,14 : 7 = <strong>{hokGalMandor} HOK</strong></div>
        </div>

        {/* SECTION 5: PAPAN COR */}
        <div className="border border-black p-3 text-[10px] font-mono space-y-0.5">
          <h3 className="font-black text-xs uppercase underline font-sans mb-1">PAPAN COR (BEKISTING)</h3>
          <div>{dptT.toFixed(2)} x 15,00 = 22,50 : 6 = 3,75</div>
          <div>{dptP.toFixed(2)} x 2,00 = 15,00 : 6 = 2,50</div>
          <div className="font-bold border-t border-black pt-0.5">Total Papan Cor = {papanCor} Lembar</div>
        </div>

        {/* SECTION 6: BETON K-250 (MANUAL) */}
        <div className="border border-black p-3 space-y-2">
          <h3 className="font-black text-xs uppercase underline">BETON K-250 (MANUAL)</h3>
          <div className="text-[10px] font-mono space-y-1">
            <div>Sloof Vertikal = {volBetonVert.toFixed(2)} M3</div>
            <div>Sloof Horizontal = {volBetonHoriz.toFixed(2)} M3</div>
            <div>Cakar Ayam Alas = {volBetonCakarAlas.toFixed(2)} M3</div>
            <div>Cakar Ayam Trap = {volBetonCakarTrap.toFixed(2)} M3</div>
            <div className="font-bold border-t border-black pt-0.5">Total Volume Beton K-250 = {volBetonTotal.toFixed(2)} M3</div>

            <div>Batu Pecah 20-30 mm : 0,769 x {volBetonTotal.toFixed(2)} = <strong>{matBatuPecah.toFixed(2)} M3</strong></div>
            <div>Semen PC (50 Kg) : 384,00 x {volBetonTotal.toFixed(2)} = <strong>{Math.round(matSemenBeton)} Zak</strong></div>
            <div>Pasir Beton : 0,494 x {volBetonTotal.toFixed(2)} = <strong>{matPasirBeton.toFixed(2)} M3</strong></div>

            <div className="pt-1 font-bold border-t border-dotted border-slate-400">Pekerjaan Beton K-250 (HOK) :</div>
            <div>Pekerja = {volBetonTotal.toFixed(2)} x 4,2170 = {(volBetonTotal * 4.2170).toFixed(2)} jam : 7 = <strong>{hokBtnPekerja} HOK</strong></div>
            <div>Tukang = {volBetonTotal.toFixed(2)} x 0,6020 = {(volBetonTotal * 0.6020).toFixed(2)} jam : 7 = <strong>{hokBtnTukang} HOK</strong></div>
            <div>Mandor = {volBetonTotal.toFixed(2)} x 0,6020 = {(volBetonTotal * 0.6020).toFixed(2)} jam : 7 = <strong>{hokBtnMandor} HOK</strong></div>
          </div>
        </div>

        {/* SECTION 7: TIMBUNAN TANAH */}
        <div className="border border-black p-3 text-[10px] font-mono space-y-0.5">
          <h3 className="font-black text-xs uppercase underline font-sans mb-1">TIMBUNAN TANAH</h3>
          <div>{dptP.toFixed(2)} x {dptLt.toFixed(2)} x {dptT.toFixed(2)} = <strong>{volTimbunan.toFixed(2)} M3</strong></div>
          <div>Pekerja = {volTimbunan.toFixed(2)} x 0,0278 = 1,25 : 7 = <strong>{hokTmbPekerja} HOK</strong></div>
          <div>Tukang = {volTimbunan.toFixed(2)} x 0,0069 = 0,31 : 7 = <strong>{hokTmbTukang} HOK</strong></div>
        </div>

        {/* TANDA TANGAN FOOTER */}
        <div className="pt-6 border-t-2 border-black flex justify-between items-end text-center font-sans">
          <div>
            <p className="text-[10px] text-black font-semibold">Tanggal Survei : {metaTanggal}</p>
            <p className="text-[10px] text-slate-500 italic mt-1">Status : Terverifikasi Engine TOS Teknik Sipil Desa</p>
          </div>
          
          <div className="grid grid-cols-2 gap-12 w-96">
            <div>
              <p className="text-[10px] font-bold mb-14">Disetujui Oleh :<br /><span className="font-normal text-slate-700">Kepala Desa Cimanggu I</span></p>
              <p className="font-black text-xs uppercase underline">{metaKades}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold mb-14">Dibuat Oleh :<br /><span className="font-normal text-slate-700">Pelaksana Kegiatan</span></p>
              <p className="font-black text-xs uppercase underline">{metaPelaksana}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
