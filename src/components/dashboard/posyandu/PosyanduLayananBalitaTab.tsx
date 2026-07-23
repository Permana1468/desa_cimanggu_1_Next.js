"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Baby, Trash2, Stethoscope, Sparkles, AlertTriangle, CheckCircle2, Calculator } from "lucide-react";
import { getPosyanduRecords, addPosyanduRecord, deletePosyanduRecord, getPosyanduBalita, updatePosyanduBalitaStatus } from "@/actions/posyandu";

const statusGiziOptions = ["Normal", "Gizi Kurang", "Stunting", "Gizi Buruk", "Gizi Lebih"];
const imunisasiOptions = ["Tidak Ada", "BCG", "DPT-HB-Hib", "Polio", "Campak/MR", "PCV", "Rotavirus"];

// Formula Perhitungan Otomatis Status Gizi berdasarkan Standar WHO / Kemenkes RI (BB/U & TB/U)
function hitungUsiaBulan(tglLahir: string | Date, tglKunjungan: string | Date): number {
  if (!tglLahir || !tglKunjungan) return 0;
  const birth = new Date(tglLahir);
  const visit = new Date(tglKunjungan);
  const months = (visit.getFullYear() - birth.getFullYear()) * 12 + (visit.getMonth() - birth.getMonth());
  return Math.max(0, months);
}

function hitungStatusGiziOtomatis(
  tglLahir: string | Date,
  tglKunjungan: string | Date,
  bbKg: number,
  tbCm: number,
  jenisKelamin: string = "L"
): { statusGizi: string; isStunting: boolean; usiaBulan: number; idealBB: number; idealTB: number; keteranganHasil: string } {
  const bulan = hitungUsiaBulan(tglLahir, tglKunjungan);
  const isMale = jenisKelamin === "L" || jenisKelamin === "LAKI_LAKI";

  // WHO Standard Median Ideal Weight (kg) & Height (cm) per month (0 - 60 months)
  const idealBB = isMale
    ? 3.3 + (bulan * 0.25)
    : 3.2 + (bulan * 0.24);

  const idealTB = isMale
    ? 50 + (bulan * 0.98)
    : 49 + (bulan * 0.95);

  let statusGizi = "Normal";
  let isStunting = false;
  let keteranganHasil = "";

  if (bbKg > 0 && idealBB > 0) {
    const ratioBB = bbKg / idealBB;
    if (ratioBB < 0.65) {
      statusGizi = "Gizi Buruk";
      keteranganHasil = `Berat Badan (${bbKg} kg) jauh di bawah standar ideal (${idealBB.toFixed(1)} kg) untuk usia ${bulan} bulan.`;
    } else if (ratioBB < 0.82) {
      statusGizi = "Gizi Kurang";
      keteranganHasil = `Berat Badan (${bbKg} kg) di bawah standar ideal (${idealBB.toFixed(1)} kg) untuk usia ${bulan} bulan.`;
    } else if (ratioBB > 1.25) {
      statusGizi = "Gizi Lebih";
      keteranganHasil = `Berat Badan (${bbKg} kg) melebihi standar ideal (${idealBB.toFixed(1)} kg) untuk usia ${bulan} bulan.`;
    } else {
      statusGizi = "Normal";
      keteranganHasil = `Berat Badan (${bbKg} kg) dalam batas normal ideal (${idealBB.toFixed(1)} kg) untuk usia ${bulan} bulan.`;
    }
  }

  if (tbCm > 0 && idealTB > 0) {
    const ratioTB = tbCm / idealTB;
    if (ratioTB < 0.88) {
      isStunting = true;
      if (statusGizi === "Normal") {
        statusGizi = "Stunting";
        keteranganHasil = `Tinggi Badan (${tbCm} cm) di bawah kurva pertambahan usia (${idealTB.toFixed(1)} cm). Terindikasi Stunting.`;
      } else {
        keteranganHasil += ` Terindikasi Stunting (TB ${tbCm} cm vs Ideal ${idealTB.toFixed(1)} cm).`;
      }
    }
  }

  return {
    statusGizi,
    isStunting,
    usiaBulan: bulan,
    idealBB: Math.round(idealBB * 10) / 10,
    idealTB: Math.round(idealTB * 10) / 10,
    keteranganHasil
  };
}

export function PosyanduLayananBalitaTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [balitas, setBalitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, balitasRes] = await Promise.all([
        getPosyanduRecords("BALITA", selectedPosyandu),
        getPosyanduBalita(selectedPosyandu)
      ]);
      setData(recordsRes);
      setBalitas(balitasRes);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPosyandu]);

  const handleTambah = async (record: any) => {
    await addPosyanduRecord(record);
    if (record.isStunting !== undefined && record.balitaId) {
      await updatePosyanduBalitaStatus(record.balitaId, record.isStunting);
    }
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data layanan ini?")) {
      await deletePosyanduRecord(id);
      fetchData();
    }
  };

  const filtered = data.filter(d =>
    (d.balita?.namaLengkap || "").toLowerCase().includes(search.toLowerCase())
  );

  const getGiziColor = (status: string) => {
    if (status === "Normal") return "bg-green-50 text-green-700 border-green-200";
    if (status === "Gizi Lebih") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-500" />
            Layanan Balita
          </h2>
          <p className="text-slate-500 text-sm mt-1">Input data pelayanan kesehatan balita per kunjungan dengan hitungan status gizi otomatis</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Input Pelayanan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama balita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-teal-50 text-teal-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Nama Balita</th>
                <th className="px-4 py-3 font-semibold">BB (kg)</th>
                <th className="px-4 py-3 font-semibold">TB (cm)</th>
                <th className="px-4 py-3 font-semibold">LK (cm)</th>
                <th className="px-4 py-3 font-semibold">Status Gizi</th>
                <th className="px-4 py-3 font-semibold">Imunisasi</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Belum ada catatan pelayanan balita.
                  </td>
                </tr>
              ) : (
                filtered.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.balita?.namaLengkap || "-"}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{d.beratBadan ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{d.tinggiBadan ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{d.lingkarKepala ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getGiziColor(d.statusGizi || "Normal")}`}>
                        {d.statusGizi || "Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.imunisasi || "-"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{d.keterangan || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ModalLayananBalita
          onClose={() => setShowModal(false)}
          onSave={handleTambah}
          balitas={balitas}
        />
      )}
    </div>
  );
}

function ModalLayananBalita({ onClose, onSave, balitas }: any) {
  const [loading, setLoading] = useState(false);
  const [balitaId, setBalitaId] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [beratBadan, setBeratBadan] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [lingkarKepala, setLingkarKepala] = useState("");
  const [statusGizi, setStatusGizi] = useState("Normal");
  const [imunisasi, setImunisasi] = useState("Tidak Ada");
  const [keterangan, setKeterangan] = useState("");
  const [autoInfo, setAutoInfo] = useState<any>(null);

  // Auto Calculation Effect whenever balita, tanggal, BB or TB changes
  useEffect(() => {
    const selectedBalita = balitas.find((b: any) => b.id === balitaId);
    const bb = parseFloat(beratBadan);
    const tb = parseFloat(tinggiBadan);

    if (selectedBalita && (bb > 0 || tb > 0)) {
      const calc = hitungStatusGiziOtomatis(
        selectedBalita.tanggalLahir,
        tanggal,
        bb || 0,
        tb || 0,
        selectedBalita.jenisKelamin
      );
      setStatusGizi(calc.statusGizi);
      setAutoInfo(calc);
    } else {
      setAutoInfo(null);
    }
  }, [balitaId, tanggal, beratBadan, tinggiBadan, balitas]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      balitaId,
      tanggal: new Date(tanggal),
      beratBadan: beratBadan ? parseFloat(beratBadan) : null,
      tinggiBadan: tinggiBadan ? parseFloat(tinggiBadan) : null,
      lingkarKepala: lingkarKepala ? parseFloat(lingkarKepala) : null,
      statusGizi,
      imunisasi,
      keterangan,
      isStunting: autoInfo?.isStunting || false
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-600" /> Catat Pelayanan Balita
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Status gizi dihitung otomatis berdasarkan standar WHO</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pilih Balita *</label>
            <select
              value={balitaId}
              onChange={(e) => setBalitaId(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium text-slate-800"
            >
              <option value="">-- Pilih Balita --</option>
              {balitas.map((b: any) => (
                <option key={b.id} value={b.id}>{b.namaLengkap} ({b.nik ? `NIK: ${b.nik}` : `RT ${b.rt}/RW ${b.rw}`})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Kunjungan *</label>
            <input
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
              type="date"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">BB (kg) *</label>
              <input
                value={beratBadan}
                onChange={(e) => setBeratBadan(e.target.value)}
                required
                type="number"
                step="0.1"
                placeholder="10.5"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">TB (cm) *</label>
              <input
                value={tinggiBadan}
                onChange={(e) => setTinggiBadan(e.target.value)}
                required
                type="number"
                step="0.1"
                placeholder="75.0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">LK (cm)</label>
              <input
                value={lingkarKepala}
                onChange={(e) => setLingkarKepala(e.target.value)}
                type="number"
                step="0.1"
                placeholder="45.0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-800"
              />
            </div>
          </div>

          {/* LIVE AUTOMATIC CALCULATION BADGE */}
          {autoInfo && (
            <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl space-y-1 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-600 animate-pulse" /> Hasil Hitung Otomatis WHO:
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  autoInfo.statusGizi === "Normal" ? "bg-green-100 text-green-800 border-green-300" :
                  autoInfo.statusGizi === "Gizi Lebih" ? "bg-amber-100 text-amber-800 border-amber-300" :
                  "bg-red-100 text-red-800 border-red-300"
                }`}>
                  {autoInfo.statusGizi} {autoInfo.isStunting && "• Stunting"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {autoInfo.keteranganHasil}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status Gizi * (Otomatis Terisi)</label>
            <select
              value={statusGizi}
              onChange={(e) => setStatusGizi(e.target.value)}
              required
              className="w-full border-2 border-teal-500 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white font-bold text-slate-900"
            >
              {statusGiziOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Imunisasi Diberikan</label>
            <select
              value={imunisasi}
              onChange={(e) => setImunisasi(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
            >
              {imunisasiOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Catatan / Keterangan</label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={2}
              placeholder="Catatan tambahan..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-sm cursor-pointer">
              {loading ? "Menyimpan..." : "Simpan Layanan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
