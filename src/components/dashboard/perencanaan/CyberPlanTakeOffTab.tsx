"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Calculator, 
  FileSpreadsheet, 
  Ruler, 
  Layers, 
  ChevronRight, 
  HardHat, 
  Droplets, 
  ArrowDownToLine, 
  BrickWall,
  Printer,
  Sparkles,
  X,
  FileText,
  CheckCircle2,
  Table,
  Hammer,
  Info,
  UserCheck,
  Calendar,
  Zap,
  Check
} from "lucide-react";
import { CetakTosDpt } from "./CetakTosDpt";

type ProjectCategory = "dpt_pdf" | "tpt" | "beton" | "uditch" | "buis" | null;

interface TosResultItem {
  categoryName?: string;
  name: string;
  volume: number;
  unit: string;
  description?: string;
}

export function CyberPlanTakeOffTab({ 
  onBack,
  onNavigateToRab
}: { 
  onBack: () => void;
  onNavigateToRab?: () => void;
}) {
  const [view, setView] = useState<"main" | "print_tos">("main");
  const [category, setCategory] = useState<ProjectCategory>("dpt_pdf");
  const [results, setResults] = useState<TosResultItem[]>([]);

  // DPT (PDF Standard) Inputs
  const [dptP, setDptP] = useState(30);
  const [dptT, setDptT] = useState(6);
  const [dptJarakTiang, setDptJarakTiang] = useState(2.0);
  const [dptLg, setDptLg] = useState(1.0);
  const [dptDg, setDptDg] = useState(0.7);
  const [dptLt, setDptLt] = useState(0.25);

  // Dynamic engineering auto-calculations
  const dptTiang = Math.max(1, Math.round(dptP / (dptJarakTiang || 2.0)));
  const dptTrap = Math.max(1, Math.round(dptT / 3));

  // Auto-calculate SNI Galian & Timbunan when Tinggi DPT (T) changes
  useEffect(() => {
    if (dptT > 0) {
      const autoLg = Math.max(0.6, Number((0.15 * dptT + 0.1).toFixed(2)));
      const autoDg = Math.max(0.4, Number((0.10 * dptT + 0.1).toFixed(2)));
      const autoLt = Math.max(0.1, Number((0.04 * dptT + 0.01).toFixed(2)));
      setDptLg(autoLg);
      setDptDg(autoDg);
      setDptLt(autoLt);
    }
  }, [dptT]);

  // Header & Signature Metadata untuk cetak
  const [metaDesa, setMetaDesa] = useState("Cimanggu 1");
  const [metaKecamatan, setMetaKecamatan] = useState("Cibungbulang");
  const [metaKabupaten, setMetaKabupaten] = useState("BOGOR");
  const [metaLokasi, setMetaLokasi] = useState("Kp. Jatake Rt. 001 Rw. 005");
  const [metaPelaksana, setMetaPelaksana] = useState("SANA SULAEMAN");
  const [metaKades, setMetaKades] = useState("HERNAWAN M. SODIK");
  const [metaTanggal, setMetaTanggal] = useState("17 September 2026");

  // TPT Simple Inputs
  const [tptP, setTptP] = useState(10);
  const [tptT, setTptT] = useState(2);
  const [tptLa, setTptLa] = useState(0.3);
  const [tptLb, setTptLb] = useState(0.6);
  const [tptD, setTptD] = useState(0.5);
  const [tptLgSimple, setTptLgSimple] = useState(0.8);

  // Beton Inputs
  const [btnP, setBtnP] = useState(100);
  const [btnL, setBtnL] = useState(3);
  const [btnT, setBtnT] = useState(0.15);
  const [btnLpb, setBtnLpb] = useState(0.1);

  // Uditch Inputs
  const [udP, setUdP] = useState(50);
  const [udType, setUdType] = useState("40x40");
  const [udTlc, setUdTlc] = useState(0.05);
  const [udTpasir, setUdTpasir] = useState(0.05);

  // Buis Inputs
  const [buisP, setBuisP] = useState(20);
  const [buisD, setBuisD] = useState(0.6);

  // DPT Calculation state store
  const calculateDPT = () => {
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
    const volPasBatu = 95.46 * scaleFactor;
    const matBatuBelah = 1.17 * volPasBatu;
    const matSemenPas = (176.00 * volPasBatu) / 50; // Zak
    const matPasirPas = 0.509 * volPasBatu;

    const hokPasPekerja = Math.round((matBatuBelah * 5.4618) / 7);
    const hokPasTukang = Math.round((matBatuBelah * 1.3655) / 7);
    const hokPasMandor = Math.round((matBatuBelah * 0.6827) / 7);

    // 3. PIPA PVC SULINGAN
    const btgPipaPvc = Math.ceil(27 * scaleFactor);

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
    const matSemenBeton = (384.00 * volBetonTotal) / 50; // Zak
    const matPasirBeton = 0.494 * volBetonTotal;

    const hokBtnPekerja = Math.round((volBetonTotal * 4.2170) / 7);
    const hokBtnTukang = Math.round((volBetonTotal * 0.6020) / 7);
    const hokBtnMandor = Math.round((volBetonTotal * 0.6020) / 7);

    // 7. TIMBUNAN TANAH
    const volTimbunan = dptP * dptLt * dptT;
    const hokTmbPekerja = Math.max(1, Math.round((volTimbunan * 0.0278) / 7));
    const hokTmbTukang = Math.max(1, Math.round((volTimbunan * 0.0069) / 7));

    // TOTAL MATERIAL REKAP
    const totalSemenZak = Math.round(matSemenPas + matSemenBeton);
    const totalBesi12Btg = bSloofVertBtg + bVertTrapBtg + bCakar1Btg + bCakar2Btg + bCakar3Btg;
    const totalBesi8Btg = bSloofHorizBtg + bHorizTrapBtg;
    const totalHokPekerja = hokBesiPekerja + hokPasPekerja + hokGalPekerja + hokBtnPekerja + hokTmbPekerja;
    const totalHokTukang = hokBesiTukang + hokPasTukang + hokBtnTukang + hokTmbTukang;
    const totalHokMandor = hokBesiMandor + hokPasMandor + hokGalMandor + hokBtnMandor;

    const computedResults = [
      // PEMBESIAN
      { categoryName: "Pembesian", name: "Besi Ø12 Sloof Vertikal & Trap & Cakar", volume: totalBesi12Btg, unit: "Batang", description: "Besi ulir/polos 12m Ø12" },
      { categoryName: "Pembesian", name: "Besi Ø8 Sengkang & Sloof Horizontal", volume: totalBesi8Btg, unit: "Batang", description: "Besi polos 12m Ø8" },
      { categoryName: "Pembesian", name: "HOK Pembesian (Pekerja)", volume: hokBesiPekerja, unit: "HOK", description: "205.11 jam / 7 jam per hari" },
      { categoryName: "Pembesian", name: "HOK Pembesian (Tukang)", volume: hokBesiTukang, unit: "HOK", description: "68.37 jam / 7 jam per hari" },
      { categoryName: "Pembesian", name: "HOK Pembesian (Mandor)", volume: hokBesiMandor, unit: "HOK", description: "68.37 jam / 7 jam per hari" },

      // PASANGAN BATU
      { categoryName: "Pasangan Batu", name: "Volume Pasangan Batu DPT", volume: Number(volPasBatu.toFixed(2)), unit: "m³", description: "Panel alas + miring + caping" },
      { categoryName: "Pasangan Batu", name: "Batu Belah", volume: Number(matBatuBelah.toFixed(2)), unit: "m³", description: "1.17 x Volume Pasangan" },
      { categoryName: "Pasangan Batu", name: "Semen PC (50 Kg)", volume: Math.round(matSemenPas), unit: "Zak", description: "176.00 kg/m³ pasangan" },
      { categoryName: "Pasangan Batu", name: "Pasir Pasang", volume: Number(matPasirPas.toFixed(2)), unit: "m³", description: "0.509 m³/m³ pasangan" },
      { categoryName: "Pasangan Batu", name: "HOK Pasangan Batu (Pekerja)", volume: hokPasPekerja, unit: "HOK", description: "5.4618 koef x vol batu" },
      { categoryName: "Pasangan Batu", name: "HOK Pasangan Batu (Tukang)", volume: hokPasTukang, unit: "HOK", description: "1.3655 koef x vol batu" },
      { categoryName: "Pasangan Batu", name: "HOK Pasangan Batu (Mandor)", volume: hokPasMandor, unit: "HOK", description: "0.6827 koef x vol batu" },

      // PIPA PVC & GALIAN & BEKISTING
      { categoryName: "Drainase & Galian", name: "Pipa PVC 2\" Sulingan Air", volume: btgPipaPvc, unit: "Batang", description: "Resapan air dinding DPT" },
      { categoryName: "Drainase & Galian", name: "Galian Pondasi", volume: Number(volGalian.toFixed(2)), unit: "m³", description: "P x Lebar Galian x Dalam Galian" },
      { categoryName: "Drainase & Galian", name: "Bekisting Papan Cor", volume: papanCor, unit: "Lembar", description: "6 m² per lembar papan" },

      // BETON K-250
      { categoryName: "Beton K-250", name: "Volume Beton K-250 Structural", volume: Number(volBetonTotal.toFixed(2)), unit: "m³", description: "Sloof + Kolom + Cakar Ayam" },
      { categoryName: "Beton K-250", name: "Batu Pecah 20-30 mm (Split)", volume: Number(matBatuPecah.toFixed(2)), unit: "m³", description: "0.769 m³/m³ beton" },
      { categoryName: "Beton K-250", name: "Semen PC (50 Kg)", volume: Math.round(matSemenBeton), unit: "Zak", description: "384.00 kg/m³ beton" },
      { categoryName: "Beton K-250", name: "Pasir Beton", volume: Number(matPasirBeton.toFixed(2)), unit: "m³", description: "0.494 m³/m³ beton" },
      { categoryName: "Beton K-250", name: "HOK Beton K-250 (Pekerja)", volume: hokBtnPekerja, unit: "HOK", description: "4.2170 koef x vol beton" },
      { categoryName: "Beton K-250", name: "HOK Beton K-250 (Tukang)", volume: hokBtnTukang, unit: "HOK", description: "0.6020 koef x vol beton" },
      { categoryName: "Beton K-250", name: "HOK Beton K-250 (Mandor)", volume: hokBtnMandor, unit: "HOK", description: "0.6020 koef x vol beton" },

      // TIMBUNAN TANAH
      { categoryName: "Timbunan Tanah", name: "Volume Timbunan Tanah", volume: Number(volTimbunan.toFixed(2)), unit: "m³", description: "P x Lebar Timbunan x Tinggi" },

      // REKAP MATERIAL & HOK
      { categoryName: "Ringkasan Total", name: "TOTAL SEMEN PC (50 KG)", volume: totalSemenZak, unit: "Zak", description: "Semen Pasangan + Semen Beton" },
      { categoryName: "Ringkasan Total", name: "TOTAL PEKERJA (HOK)", volume: totalHokPekerja, unit: "HOK", description: "Akumulasi HOK Pekerja seluruh item" },
      { categoryName: "Ringkasan Total", name: "TOTAL TUKANG (HOK)", volume: totalHokTukang, unit: "HOK", description: "Akumulasi HOK Tukang seluruh item" },
      { categoryName: "Ringkasan Total", name: "TOTAL MANDOR (HOK)", volume: totalHokMandor, unit: "HOK", description: "Akumulasi HOK Mandor seluruh item" },
    ];

    setResults(computedResults);
    return computedResults;
  };

  const calculateTPT = () => {
    const pembersihan = tptP * tptLgSimple;
    const galian = tptLgSimple * tptD * tptP;
    const pasir = tptLgSimple * 0.05 * tptP;
    const pasanganBatu = ((tptLa + tptLb) / 2) * tptT * tptP;
    const sisiMiring = Math.sqrt(Math.pow(tptLb - tptLa, 2) + Math.pow(tptT, 2));
    const plesteran = (tptLa * tptP) + (sisiMiring * tptP);
    const suling = (pasanganBatu / 2);

    setResults([
      { name: "Pembersihan Lahan", volume: pembersihan, unit: "m²", description: "P x Lg" },
      { name: "Galian Tanah Biasa", volume: galian, unit: "m³", description: "Lg x D x P" },
      { name: "Urugan Pasir Dasar Pondasi", volume: pasir, unit: "m³", description: "Lg x 0.05 x P" },
      { name: "Pasangan Batu Kali", volume: pasanganBatu, unit: "m³", description: "((La+Lb)/2) x T x P" },
      { name: "Plesteran (Atas & Miring)", volume: plesteran, unit: "m²", description: "(La x P) + (Sisi Miring x P)" },
      { name: "Pipa Suling-Suling", volume: Math.ceil(suling), unit: "Bh", description: "1 suling tiap 2m² penampang" },
    ]);
  };

  const calculateBeton = () => {
    const penyiapan = btnP * btnL;
    const lpb = btnP * btnL * btnLpb;
    const plastik = btnP * btnL;
    const bekisting = (2 * btnP) * btnT;
    const beton = btnP * btnL * btnT;

    setResults([
      { name: "Penyiapan Badan Jalan", volume: penyiapan, unit: "m²", description: "P x L" },
      { name: "Lapis Pondasi Bawah (Sirtu)", volume: lpb, unit: "m³", description: "P x L x Tebal LPB" },
      { name: "Plastik Cor", volume: plastik, unit: "m²", description: "P x L" },
      { name: "Bekisting (Papan Cor)", volume: bekisting, unit: "m²", description: "2 x P x Tebal Beton" },
      { name: "Volume Beton Cor", volume: beton, unit: "m³", description: "P x L x Tebal Beton" },
    ]);
  };

  const calculateUditch = () => {
    const lebarLuar = 0.52;
    const tinggiLuar = 0.55;
    
    const lebarGalian = lebarLuar + 0.3;
    const dalamGalian = tinggiLuar + udTpasir + udTlc;
    
    const galian = lebarGalian * dalamGalian * udP;
    const pasir = lebarGalian * udTpasir * udP;
    const lantaiKerja = lebarGalian * udTlc * udP;
    const jumlahUnit = Math.ceil(udP / 1.2);

    setResults([
      { name: "Galian Tanah", volume: Number(galian.toFixed(2)), unit: "m³", description: "Lebar Galian x Dalam x P" },
      { name: "Pasir Urug", volume: Number(pasir.toFixed(2)), unit: "m³", description: "Lg x Tebal Pasir x P" },
      { name: "Lantai Kerja (Beton B0)", volume: Number(lantaiKerja.toFixed(2)), unit: "m³", description: "Lg x Tebal LC x P" },
      { name: `U-Ditch Tipe ${udType}`, volume: jumlahUnit, unit: "Bh", description: "P / 1.2m" },
      { name: `Cover U-Ditch ${udType}`, volume: jumlahUnit, unit: "Bh", description: "Diasumsikan 1 cover per unit" },
    ]);
  };

  const calculateBuis = () => {
    const lebarGalian = buisD + 0.2;
    const dalamGalian = buisD + 0.3;
    
    const galian = lebarGalian * dalamGalian * buisP;
    const pasir = lebarGalian * 0.05 * buisP;
    const jumlahBuis = Math.ceil(buisP / 1.0);

    setResults([
      { name: "Galian Tanah", volume: Number(galian.toFixed(2)), unit: "m³", description: "Lebar Galian x Dalam x P" },
      { name: "Pasir Urug", volume: Number(pasir.toFixed(2)), unit: "m³", description: "Lg x 0.05 x P" },
      { name: "Buis Beton", volume: jumlahBuis, unit: "Bh", description: "P / 1m" },
    ]);
  };

  const handleCalculate = () => {
    if (category === "dpt_pdf") calculateDPT();
    else if (category === "tpt") calculateTPT();
    else if (category === "beton") calculateBeton();
    else if (category === "uditch") calculateUditch();
    else if (category === "buis") calculateBuis();
  };

  const handleLanjutRab = () => {
    const computedResults = calculateDPT();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tos_dpt_sync_data", JSON.stringify({
          dptP,
          dptT,
          dptJarakTiang,
          dptTiang,
          dptTrap,
          dptLg,
          dptDg,
          dptLt,
          metaDesa,
          metaKecamatan,
          metaLokasi,
          metaKades,
          metaPelaksana,
          items: computedResults,
          timestamp: Date.now()
        }));
      } catch (err) {}
    }
    if (onNavigateToRab) {
      onNavigateToRab();
    }
  };

  if (view === "print_tos") {
    return (
      <CetakTosDpt
        metaKabupaten={metaKabupaten}
        metaKecamatan={metaKecamatan}
        metaDesa={metaDesa}
        metaLokasi={metaLokasi}
        metaPelaksana={metaPelaksana}
        metaKades={metaKades}
        metaTanggal={metaTanggal}
        dptP={dptP}
        dptT={dptT}
        dptJarakTiang={dptJarakTiang}
        dptTiang={dptTiang}
        dptTrap={dptTrap}
        dptLg={dptLg}
        dptDg={dptDg}
        dptLt={dptLt}
        onBack={() => setView("main")}
      />
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-80px)] rounded-[2.5rem] p-6 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Ruler className="text-amber-600" /> Take Off Sheet (TOS DPT)
            </h2>
            <p className="text-slate-500 text-sm">Kalkulator Volume AHSP & DPT Bertulang Otomatis Presisi PDF</p>
          </div>
        </div>

        {category === "dpt_pdf" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                calculateDPT();
                setView("print_tos");
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <Printer size={18} /> Cetak TOS PDF Standard
            </button>
            {onNavigateToRab && (
              <button
                onClick={handleLanjutRab}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm"
              >
                <Zap size={18} className="text-amber-300" /> Lanjut ke RAB Desa
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Category & Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Pilih Jenis Pekerjaan</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {setCategory("dpt_pdf"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all col-span-2 ${category === "dpt_pdf" ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm ring-2 ring-amber-200' : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'}`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <BrickWall size={20} className="text-amber-600" />
                  <span>DPT Bertulang & Cakar Ayam (Standar Format PDF)</span>
                </div>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">TOS DPT Lengkap: Besi + Batu + Beton K250</span>
              </button>

              <button 
                onClick={() => {setCategory("tpt"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === "tpt" ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
              >
                <BrickWall size={20} />
                <span className="text-xs font-bold text-center">TPT Gravitasi Sederhana</span>
              </button>

              <button 
                onClick={() => {setCategory("beton"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === "beton" ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
              >
                <Layers size={20} />
                <span className="text-xs font-bold text-center">Betonisasi Jalan</span>
              </button>

              <button 
                onClick={() => {setCategory("uditch"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === "uditch" ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
              >
                <ArrowDownToLine size={20} />
                <span className="text-xs font-bold text-center">Saluran U-Ditch</span>
              </button>

              <button 
                onClick={() => {setCategory("buis"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === "buis" ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
              >
                <Droplets size={20} />
                <span className="text-xs font-bold text-center">Buis Beton</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC INPUT FORM */}
          {category && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Dimensi & Parameter Lapangan</span>
                {category === "dpt_pdf" && <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Presisi PDF</span>}
              </h3>
              
              <div className="space-y-4">
                
                {/* DPT PDF INPUTS */}
                {category === "dpt_pdf" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Panjang DPT (P) [m']</label>
                        <input type="number" value={dptP} onChange={(e) => setDptP(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Tinggi DPT (T) [m']</label>
                        <input type="number" value={dptT} onChange={(e) => setDptT(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Jarak Antar Tiang [m']</label>
                        <input type="number" step="0.5" value={dptJarakTiang} onChange={(e) => setDptJarakTiang(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Jumlah Tiang (Otomatis)</label>
                        <input type="number" value={dptTiang} readOnly className="w-full p-2 text-sm border border-amber-300 bg-amber-50 text-amber-950 rounded-lg font-black" />
                      </div>
                    </div>

                    {/* DPT ENGINEERING FORMULA CARDS */}
                    <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-amber-400">
                        <span className="flex items-center gap-1.5"><Info size={14} /> Kaidah Rumus Teknik Sipil & SNI DPT:</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">Otomatis SNI</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-slate-800 rounded border border-slate-700">
                          <span className="text-slate-400 block font-sans">1. Jumlah Tiang DPT:</span>
                          <span className="font-mono font-bold text-emerald-400">{dptP}m / {dptJarakTiang}m = <span className="underline">{dptTiang} Tiang</span></span>
                        </div>
                        <div className="p-2 bg-slate-800 rounded border border-slate-700">
                          <span className="text-slate-400 block font-sans">2. Jumlah Trap DPT:</span>
                          <span className="font-mono font-bold text-emerald-400">{dptT}m / 3m = <span className="underline">{dptTrap} Trap</span></span>
                        </div>
                      </div>
                      <div className="p-2 bg-slate-800/80 rounded border border-slate-700/80 text-[10px] space-y-1 font-mono">
                        <div className="text-amber-300 font-bold font-sans">3. Dimensi Galian & Timbunan (SNI Standard):</div>
                        <div className="text-slate-300">
                          • Lebar Galian: <span className="text-emerald-400 font-bold">0.15T + 0.1m = {dptLg}m</span> | Dalam Galian: <span className="text-emerald-400 font-bold">0.10T + 0.1m = {dptDg}m</span>
                        </div>
                        <div className="text-slate-300">
                          • Lebar Timbunan: <span className="text-emerald-400 font-bold">0.04T + 0.01m = {dptLt}m</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Lebar Galian [m] (SNI)</label>
                        <input type="number" step="0.05" value={dptLg} onChange={(e) => setDptLg(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-slate-800" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Dalam Galian [m] (SNI)</label>
                        <input type="number" step="0.05" value={dptDg} onChange={(e) => setDptDg(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-slate-800" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">Lebar Timbunan [m] (SNI)</label>
                        <input type="number" step="0.01" value={dptLt} onChange={(e) => setDptLt(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-slate-800" />
                      </div>
                    </div>

                    {/* FORM INPUT TANDA TANGAN & METADATA DOKUMEN */}
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3 text-xs">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
                        <UserCheck size={16} className="text-amber-700" /> Form Metadata Tanda Tangan Cetak TOS
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-amber-900 font-bold block mb-1">Kepala Desa (Disetujui)</label>
                          <input type="text" value={metaKades} onChange={(e) => setMetaKades(e.target.value)} className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs font-semibold focus:outline-none focus:border-amber-600" />
                        </div>
                        <div>
                          <label className="text-[10px] text-amber-900 font-bold block mb-1">Pelaksana Kegiatan (Dibuat)</label>
                          <input type="text" value={metaPelaksana} onChange={(e) => setMetaPelaksana(e.target.value)} className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs font-semibold focus:outline-none focus:border-amber-600" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-amber-900 font-bold block mb-1">Tanggal Survei Lapangan</label>
                          <input type="text" value={metaTanggal} onChange={(e) => setMetaTanggal(e.target.value)} className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs font-semibold focus:outline-none focus:border-amber-600" />
                        </div>
                        <div>
                          <label className="text-[10px] text-amber-900 font-bold block mb-1">Lokasi Kegiatan</label>
                          <input type="text" value={metaLokasi} onChange={(e) => setMetaLokasi(e.target.value)} className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs font-semibold focus:outline-none focus:border-amber-600" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* TPT SIMPLE INPUTS */}
                {category === "tpt" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Panjang (P) [m]</label>
                        <input type="number" value={tptP} onChange={(e) => setTptP(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tinggi Total (T) [m]</label>
                        <input type="number" value={tptT} onChange={(e) => setTptT(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Lebar Atas (La) [m]</label>
                        <input type="number" value={tptLa} onChange={(e) => setTptLa(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Lebar Bawah (Lb) [m]</label>
                        <input type="number" value={tptLb} onChange={(e) => setTptLb(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                  </>
                )}

                {/* BETON INPUTS */}
                {category === "beton" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Panjang (P) [m]</label>
                        <input type="number" value={btnP} onChange={(e) => setBtnP(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Lebar (L) [m]</label>
                        <input type="number" value={btnL} onChange={(e) => setBtnL(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                  </>
                )}

                {/* UDITCH INPUTS */}
                {category === "uditch" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Panjang Saluran (P) [m]</label>
                      <input type="number" value={udP} onChange={(e) => setUdP(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                    </div>
                  </>
                )}

                {/* BUIS INPUTS */}
                {category === "buis" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Panjang Saluran (P) [m]</label>
                      <input type="number" value={buisP} onChange={(e) => setBuisP(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                    </div>
                  </>
                )}

                <button 
                  onClick={handleCalculate}
                  className={`w-full mt-4 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md ${category === "dpt_pdf" ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black' : 'bg-slate-800 hover:bg-emerald-600 text-white'}`}
                >
                  <Calculator size={18} /> Hitung Take Off Sheet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Results */}
        <div className="lg:col-span-7">
          <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200 min-h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-500" /> Hasil Kalkulasi Take Off Sheet
                </h3>
                <p className="text-slate-500 text-sm">
                  {results.length === 0 
                    ? "Pilih kategori dan masukkan dimensi di sebelah kiri, lalu klik Hitung Take Off Sheet."
                    : "Rincian volume pekerjaan, material, dan HOK berdasarkan standar teknik sipil desa."}
                </p>
              </div>

              {results.length > 0 && category === "dpt_pdf" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView("print_tos")}
                    className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Printer size={15} /> Preview Lembar TOS
                  </button>
                </div>
              )}
            </div>

            {results.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider font-bold">
                      <th className="px-4 py-3 border-b border-slate-200">Uraian Pekerjaan / Material</th>
                      <th className="px-4 py-3 border-b border-slate-200">Rumus & Keterangan</th>
                      <th className="px-4 py-3 border-b border-slate-200 text-right">Volume</th>
                      <th className="px-4 py-3 border-b border-slate-200 text-center">Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((item, idx) => {
                      const isHeaderCategory = idx === 0 || results[idx - 1]?.categoryName !== item.categoryName;
                      return (
                        <tr key={idx} className={`hover:bg-slate-50 transition-colors ${item.categoryName === "Ringkasan Total" ? 'bg-amber-50/50 font-bold' : ''}`}>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {item.categoryName && isHeaderCategory && (
                              <div className="text-[10px] font-black uppercase text-amber-700 tracking-wider mb-0.5">
                                [ {item.categoryName} ]
                              </div>
                            )}
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.description}</td>
                          <td className={`px-4 py-3 text-sm font-black text-right font-mono ${item.categoryName === "Ringkasan Total" ? 'text-amber-800 text-base' : 'text-emerald-600'}`}>
                            {Number.isInteger(item.volume) ? item.volume : item.volume.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-500 text-center">{item.unit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button onClick={() => setResults([])} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                    Reset Data
                  </button>
                  
                  {category === "dpt_pdf" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setView("print_tos")}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-sm font-black flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Printer size={16} /> Cetak TOS PDF
                      </button>
                      {onNavigateToRab && (
                        <button 
                          onClick={handleLanjutRab}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm transition-colors"
                        >
                          <Zap size={16} className="text-amber-300" /> Sinkronkan & Buat RAB Desa <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50">
                <HardHat size={52} className="mb-3 text-amber-400 animate-pulse" />
                <p className="font-bold text-slate-700">Belum ada data kalkulasi TOS</p>
                <p className="text-xs text-slate-400 max-w-sm text-center mt-1">
                  Klik tombol <span className="font-bold text-amber-700">Hitung Take Off Sheet</span> di panel kiri untuk memproses parameter dimensi.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}


