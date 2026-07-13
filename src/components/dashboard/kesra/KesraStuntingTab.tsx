"use client";

import { useState, useEffect } from "react";
import { TrendingDown, Stethoscope, Search, AlertTriangle, ArrowRight, UserCheck, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { getKesraStuntingList } from "@/actions/kesra";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function KesraStuntingTab({ session, onTabChange }: any) {
  const [balitas, setBalitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState<any>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getKesraStuntingList();
      setBalitas(res);
      if (res.length > 0) {
        setSelectedChild(res[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Helper: calculate age in months
  const getAgeInMonths = (birthDateStr: string, measureDateStr?: string) => {
    const birth = new Date(birthDateStr);
    const measure = measureDateStr ? new Date(measureDateStr) : new Date();
    return (measure.getFullYear() - birth.getFullYear()) * 12 + (measure.getMonth() - birth.getMonth());
  };

  // Simple Z-Score WHO Standard approximations (0-60 months)
  const evaluateGizi = (ageInMonths: number, height: number, weight: number, gender: string) => {
    if (height <= 0 || weight <= 0) {
      return {
        status: "Belum Diukur",
        color: "text-slate-500 bg-slate-50 border border-slate-200",
        heightZ: 0,
        weightZ: 0,
        recommendation: "Lengkapi data tinggi badan dan berat badan balita pada posyandu."
      };
    }

    // Height Z-score WHO approximation
    // At birth: 50cm, moves up.
    const expectedHeight = 50 + (ageInMonths * 1.2); 
    const heightSD = 3;
    const heightZ = (height - expectedHeight) / heightSD;

    // Weight Z-score WHO approximation
    // At birth: 3.2kg, moves up.
    const expectedWeight = 3.2 + (ageInMonths * 0.4);
    const weightSD = 1.2;
    const weightZ = (weight - expectedWeight) / weightSD;

    let status = "Normal";
    let color = "text-emerald-600 bg-emerald-50 border border-emerald-200";
    let recommendation = "";

    if (heightZ < -2) {
      status = "Stunting";
      color = "text-red-600 bg-red-50 border border-red-200";
      recommendation = "Jadwalkan Pemberian Makanan Tambahan (PMT) & suplemen Vitamin A.";
    } else if (weightZ < -2) {
      status = "Gizi Kurang";
      color = "text-amber-600 bg-amber-50 border border-amber-200";
      recommendation = "Intervensi PMT Pemulihan Tinggi Kalori & Protein.";
    }

    return { status, color, heightZ, weightZ, recommendation };
  };

  const filteredBalitas = balitas.filter(b =>
    b.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    (b.nik && b.nik.includes(search))
  );

  const getChartData = (child: any) => {
    if (!child || !child.records) return [];
    return child.records.map((r: any) => {
      const age = getAgeInMonths(child.tanggalLahir, r.tanggal);
      const evalResult = evaluateGizi(age, r.tinggiBadan || 0, r.beratBadan || 0, child.jenisKelamin);
      return {
        tanggal: new Date(r.tanggal).toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
        "Tinggi Badan (cm)": r.tinggiBadan || 0,
        "Berat Badan (kg)": r.beratBadan || 0,
        "Z-Score TB/U": parseFloat(evalResult.heightZ.toFixed(2)),
        "Batas Normal": -2
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-emerald-500" />
          Early Warning System (EWS) Stunting Balita
        </h2>
        <p className="text-slate-500 text-sm mt-1">Sistem pemantauan pertumbuhan balita, analisis Z-Score antropometri WHO, dan rekomendasi intervensi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Balita Search and Selector */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-[580px]">
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari balita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredBalitas.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">Balita tidak ditemukan.</div>
            ) : (
              filteredBalitas.map(b => {
                const age = getAgeInMonths(b.tanggalLahir);
                const lastRecord = b.records[b.records.length - 1];
                const evalInfo = lastRecord ? evaluateGizi(age, lastRecord.tinggiBadan || 0, lastRecord.beratBadan || 0, b.jenisKelamin) : { status: "Belum Diukur", color: "text-slate-500 bg-slate-50 border border-slate-200" };

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedChild(b)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      selectedChild?.id === b.id
                        ? "border-emerald-500 bg-emerald-50/20"
                        : "border-slate-100 hover:border-slate-200 bg-slate-50/30"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{b.namaLengkap}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">L/P: {b.jenisKelamin} | {age} Bulan</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${evalInfo.color}`}>
                      {evalInfo.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Z-Score Graph and Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {selectedChild ? (
            <>
              {/* Profile and Intervention Panel */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Detail Pertumbuhan</span>
                    <h3 className="text-xl font-bold text-slate-800 mt-1">{selectedChild.namaLengkap}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">NIK: {selectedChild.nik || "-"} | Ibu: {selectedChild.namaOrangTua}</p>
                  </div>
                  
                  {/* Intervention Trigger */}
                  {(() => {
                    const age = getAgeInMonths(selectedChild.tanggalLahir);
                    const lastRec = selectedChild.records[selectedChild.records.length - 1];
                    if (!lastRec) return null;
                    const evalResult = evaluateGizi(age, lastRec.tinggiBadan || 0, lastRec.beratBadan || 0, selectedChild.jenisKelamin);
                    
                    if (evalResult.status !== "Normal") {
                      return (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 md:max-w-md shrink-0">
                          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                          <div>
                            <h5 className="text-xs font-bold text-rose-800">Rekomendasi EWS:</h5>
                            <p className="text-[10px] text-rose-700/80 mt-0.5">{evalResult.recommendation}</p>
                            <button
                              onClick={() => onTabChange("pmt")}
                              className="text-[10px] font-black text-rose-600 hover:text-rose-800 flex items-center gap-0.5 mt-2 hover:underline transition-all"
                            >
                              Buka Distribusi PMT <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                          <h5 className="text-xs font-bold text-emerald-800">Status Aman</h5>
                          <p className="text-[10px] text-emerald-700/80 mt-0.5">Pertumbuhan anak terpantau sesuai garis Z-Score normal.</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Chart Recharts */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-4">Tren Antropometri Anak vs Standard Z-Score</h4>
                {selectedChild.records.length === 0 ? (
                  <div className="h-[280px] flex items-center justify-center text-slate-400 text-xs">Belum ada riwayat pengukuran posyandu.</div>
                ) : (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getChartData(selectedChild)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="Tinggi Badan (cm)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Berat Badan (kg)" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Z-Score TB/U" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="Batas Normal" stroke="#cbd5e1" strokeWidth={1} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Historical Measuring Table */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-4">Riwayat Pengukuran Posyandu</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="px-3 py-2 font-semibold">Tanggal</th>
                        <th className="px-3 py-2 font-semibold">Tinggi Badan (cm)</th>
                        <th className="px-3 py-2 font-semibold">Berat Badan (kg)</th>
                        <th className="px-3 py-2 font-semibold">Z-Score TB/U</th>
                        <th className="px-3 py-2 font-semibold">Status Gizi</th>
                        <th className="px-3 py-2 font-semibold">Petugas Posyandu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedChild.records.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-4 text-center text-slate-400">Belum ada riwayat pengukuran.</td>
                        </tr>
                      ) : (
                        [...selectedChild.records].reverse().map((r: any) => {
                          const age = getAgeInMonths(selectedChild.tanggalLahir, r.tanggal);
                          const evalInfo = evaluateGizi(age, r.tinggiBadan || 0, r.beratBadan || 0, selectedChild.jenisKelamin);
                          return (
                            <tr key={r.id}>
                              <td className="px-3 py-2">{new Date(r.tanggal).toLocaleDateString("id-ID")}</td>
                              <td className="px-3 py-2">{r.tinggiBadan || "-"} cm</td>
                              <td className="px-3 py-2">{r.beratBadan || "-"} kg</td>
                              <td className="px-3 py-2 font-mono">{evalInfo.heightZ.toFixed(2)}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${evalInfo.color}`}>
                                  {evalInfo.status}
                                </span>
                              </td>
                              <td className="px-3 py-2">{r.kondisiUmum || "-"}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center text-slate-400 rounded-2xl shadow-sm border border-slate-100">
              Pilih anak di sebelah kiri untuk melihat rekam medis pertumbuhan Z-Score.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
