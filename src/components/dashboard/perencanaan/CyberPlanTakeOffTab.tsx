"use client";

import { useState } from "react";
import { ArrowLeft, Calculator, FileSpreadsheet, Ruler, Layers, ChevronRight, HardHat, Droplets, ArrowDownToLine, BrickWall } from "lucide-react";


type ProjectCategory = "tpt" | "beton" | "uditch" | "buis" | null;

interface TosResultItem {
  name: string;
  volume: number;
  unit: string;
  description?: string;
}

export function CyberPlanTakeOffTab({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<ProjectCategory>(null);
  const [results, setResults] = useState<TosResultItem[]>([]);

  // TPT Inputs
  const [tptP, setTptP] = useState(10);
  const [tptT, setTptT] = useState(2);
  const [tptLa, setTptLa] = useState(0.3);
  const [tptLb, setTptLb] = useState(0.6);
  const [tptD, setTptD] = useState(0.5);
  const [tptLg, setTptLg] = useState(0.8);

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

  const calculateTPT = () => {
    const pembersihan = tptP * tptLg;
    const galian = tptLg * tptD * tptP;
    const pasir = tptLg * 0.05 * tptP;
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
    if (category === "tpt") calculateTPT();
    else if (category === "beton") calculateBeton();
    else if (category === "uditch") calculateUditch();
    else if (category === "buis") calculateBuis();
  };

  return (
    <div className="bg-white min-h-[calc(100vh-80px)] rounded-[2.5rem] p-6 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Ruler className="text-emerald-600" /> Take Off Sheet (TOS)
          </h2>
          <p className="text-slate-500 text-sm">Kalkulator Volume AHSP Otomatis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Category & Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Pilih Jenis Pekerjaan</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {setCategory("tpt"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === "tpt" ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
              >
                <BrickWall size={24} />
                <span className="text-xs font-bold text-center">Tembok Penahan Tanah (TPT)</span>
              </button>
              <button 
                onClick={() => {setCategory("beton"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === "beton" ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
              >
                <Layers size={24} />
                <span className="text-xs font-bold text-center">Betonisasi Jalan</span>
              </button>
              <button 
                onClick={() => {setCategory("uditch"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === "uditch" ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
              >
                <ArrowDownToLine size={24} />
                <span className="text-xs font-bold text-center">Saluran U-Ditch</span>
              </button>
              <button 
                onClick={() => {setCategory("buis"); setResults([]);}}
                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${category === "buis" ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
              >
                <Droplets size={24} />
                <span className="text-xs font-bold text-center">Buis Beton (Gorong-gorong)</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC INPUT FORM */}
          {category && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">
                Dimensi Lapangan
              </h3>
              <div className="space-y-4">
                
                {/* TPT INPUTS */}
                {category === "tpt" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Panjang (P) [m]</label>
                        <input type="number" value={tptP} onChange={(e) => setTptP(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tinggi Total (T) [m]</label>
                        <input type="number" value={tptT} onChange={(e) => setTptT(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Lebar Atas (La) [m]</label>
                        <input type="number" value={tptLa} onChange={(e) => setTptLa(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Lebar Bawah (Lb) [m]</label>
                        <input type="number" value={tptLb} onChange={(e) => setTptLb(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Kedalaman Galian [m]</label>
                        <input type="number" value={tptD} onChange={(e) => setTptD(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Lebar Galian Dasar [m]</label>
                        <input type="number" value={tptLg} onChange={(e) => setTptLg(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
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
                        <input type="number" value={btnP} onChange={(e) => setBtnP(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Lebar (L) [m]</label>
                        <input type="number" value={btnL} onChange={(e) => setBtnL(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tebal Beton [m]</label>
                        <input type="number" value={btnT} step="0.01" onChange={(e) => setBtnT(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tebal Agregat LPB [m]</label>
                        <input type="number" value={btnLpb} step="0.01" onChange={(e) => setBtnLpb(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
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
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Tipe U-Ditch</label>
                      <select value={udType} onChange={(e) => setUdType(e.target.value)} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500">
                        <option value="30x30">30 x 30 cm</option>
                        <option value="40x40">40 x 40 cm</option>
                        <option value="50x50">50 x 50 cm</option>
                        <option value="60x60">60 x 60 cm</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tebal Pasir Urug [m]</label>
                        <input type="number" value={udTpasir} step="0.01" onChange={(e) => setUdTpasir(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Tebal Lantai Kerja [m]</label>
                        <input type="number" value={udTlc} step="0.01" onChange={(e) => setUdTlc(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                      </div>
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
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Diameter Dalam Buis [m]</label>
                      <input type="number" value={buisD} step="0.1" onChange={(e) => setBuisD(Number(e.target.value))} className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500" />
                    </div>
                  </>
                )}

                <button 
                  onClick={handleCalculate}
                  className="w-full mt-4 bg-slate-800 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Calculator size={18} /> Kalkulasi Volume
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Results */}
        <div className="lg:col-span-8">
          <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200 min-h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-500" /> Hasil Kalkulasi Take Off Sheet
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {results.length === 0 
                ? "Pilih kategori dan masukkan dimensi di sebelah kiri, lalu klik Kalkulasi."
                : "Volume pekerjaan ini akan digunakan sebagai dasar perhitungan RAB AHSP."}
            </p>

            {results.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 border-b border-slate-200">Uraian Pekerjaan</th>
                      <th className="px-4 py-3 border-b border-slate-200">Rumus / Keterangan</th>
                      <th className="px-4 py-3 border-b border-slate-200 text-right">Volume</th>
                      <th className="px-4 py-3 border-b border-slate-200 text-center">Satuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{item.description}</td>
                        <td className="px-4 py-3 text-sm font-black text-emerald-600 text-right font-mono">
                          {Number.isInteger(item.volume) ? item.volume : item.volume.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-slate-500 text-center">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <button onClick={() => setResults([])} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                    Reset
                  </button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-sm transition-colors">
                    Lanjut ke RAB <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-300 rounded-2xl">
                <HardHat size={48} className="mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">Belum ada data kalkulasi</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* IMO ROBOT MOTION COMPANION */}

    </div>
  );
}
