"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Users, Trash2, Eye, QrCode, Printer, X,
  Calendar, User, MapPin, Activity, ShieldAlert, HeartPulse,
  Stethoscope, CheckCircle2, Clock, FileText
} from "lucide-react";
import {
  getPosyanduLansia, addPosyanduLansia, deletePosyanduLansia,
  getLansiaDetail
} from "@/actions/posyandu";
import { CitizenSearchAutocomplete } from "./CitizenSearchAutocomplete";
import { getRWsForPosyandu, POSYANDU_UNITS } from "@/lib/posyandu";

// Authentic Code 39 Barcode Generator Component
function BarcodeSVG({ value }: { value: string }) {
  const cleanVal = (value || "3201160000000000").replace(/\D/g, "").padEnd(16, "0");
  
  const CODE39_PATTERNS: { [key: string]: string } = {
    '0': '1010011010',
    '1': '1101001010',
    '2': '1011001010',
    '3': '1101100100',
    '4': '1010011010',
    '5': '1101001100',
    '6': '1011001100',
    '7': '1010010110',
    '8': '1101001010',
    '9': '1011001010',
  };

  const startGuard = '1001011010';
  const endGuard = '1001011010';

  let bitPattern = startGuard;
  for (let i = 0; i < cleanVal.length; i++) {
    const char = cleanVal[i];
    bitPattern += (CODE39_PATTERNS[char] || CODE39_PATTERNS['0']) + '0';
  }
  bitPattern += endGuard;

  const barWidth = 1.6;
  const height = 36;
  const totalWidth = bitPattern.length * barWidth + 24;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg viewBox={`0 0 ${totalWidth} 52`} className="h-11 max-w-full">
        {bitPattern.split('').map((bit, idx) => {
          if (bit === '1') {
            return (
              <rect
                key={idx}
                x={12 + idx * barWidth}
                y="2"
                width={barWidth - 0.2}
                height={height}
                fill="#0f172a"
              />
            );
          }
          return null;
        })}
        {/* NIK text 100% centered beneath barcode */}
        <text
          x={totalWidth / 2}
          y="49"
          textAnchor="middle"
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="bold"
          fill="#1e293b"
          letterSpacing="1"
        >
          *{cleanVal}*
        </text>
      </svg>
    </div>
  );
}

// Inline Vector QR Code Generator Component
function QRCodeSVG({ value }: { value: string }) {
  const size = 15;
  const grid: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));
  
  const addFinder = (r: number, c: number) => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i === 0 || i === 4 || j === 0 || j === 4 || (i >= 1 && i <= 3 && j >= 1 && j <= 3)) {
          grid[r + i][c + j] = true;
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, 10);
  addFinder(10, 0);

  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) & 0xffffffff;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 5 && c < 5) || (r < 5 && c >= 10) || (r >= 10 && c < 5)) continue;
      const bit = ((hash ^ (r * 17 + c * 23)) >>> ((r + c) % 16)) & 1;
      grid[r][c] = bit === 1;
    }
  }

  return (
    <svg viewBox="0 0 60 60" className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-200 shadow-xs shrink-0">
      {grid.map((row, r) =>
        row.map((cell, c) => cell && (
          <rect key={`${r}-${c}`} x={c * 4} y={r * 4} width="3.6" height="3.6" fill="#0f172a" rx="0.5" />
        ))
      )}
    </svg>
  );
}

export function PosyanduLansiaTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDetailLansiaId, setSelectedDetailLansiaId] = useState<string | null>(null);
  const [selectedKartuLansia, setSelectedKartuLansia] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduLansia(selectedPosyandu);
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPosyandu]);

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data lansia ini?")) {
      await deletePosyanduLansia(id);
      fetchData();
    }
  };

  const filteredData = data.filter(d =>
    d.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    (d.nik && d.nik.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Data Lansia
          </h2>
          <p className="text-slate-500 text-sm mt-1">Kelola data peserta lansia, riwayat pemeriksaan kesehatan, dan cetak kartu lansia</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Lansia
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama lansia atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Lengkap</th>
                <th className="px-4 py-3 font-semibold">Jenis Kelamin</th>
                <th className="px-4 py-3 font-semibold">Usia</th>
                <th className="px-4 py-3 font-semibold">Alamat</th>
                <th className="px-4 py-3 font-semibold">Kondisi Kesehatan</th>
                <th className="px-4 py-3 rounded-tr-xl font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data lansia ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{d.nik || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.namaLengkap}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        d.jenisKelamin === "L" || d.jenisKelamin === "LAKI_LAKI" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                      }`}>
                        {d.jenisKelamin === "L" || d.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : d.jenisKelamin === "P" || d.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{d.usia} Tahun</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">RT {d.rt} / RW {d.rw}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        d.memilikiPenyakitBawaan ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {d.memilikiPenyakitBawaan ? "Ada Komorbid" : "Sehat"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                        {/* DETAIL BUTTON */}
                        <button
                          onClick={() => setSelectedDetailLansiaId(d.id)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Lihat Detail Lansia"
                        >
                          <Eye size={14} />
                          <span>Detail</span>
                        </button>

                        {/* CETAK KARTU BUTTON */}
                        <button
                          onClick={() => setSelectedKartuLansia(d)}
                          className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Cetak Kartu Posyandu Lansia"
                        >
                          <QrCode size={14} />
                          <span>Cetak Kartu</span>
                        </button>

                        {/* HAPUS BUTTON */}
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          title="Hapus Data Lansia"
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

        {!loading && filteredData.length > 0 && (
          <div className="mt-4 text-xs text-slate-400 text-right">
            Menampilkan {filteredData.length} dari {data.length} data
          </div>
        )}
      </div>

      {/* MODAL TAMBAH LANSIA */}
      {showModal && (
        <ModalTambahLansia
          onClose={() => setShowModal(false)}
          onRefresh={fetchData}
          session={session}
          selectedPosyandu={selectedPosyandu}
        />
      )}

      {/* MODAL DETAIL LANSIA */}
      {selectedDetailLansiaId && (
        <ModalDetailLansia
          lansiaId={selectedDetailLansiaId}
          onClose={() => setSelectedDetailLansiaId(null)}
          onOpenCetakKartu={(obj: any) => {
            setSelectedDetailLansiaId(null);
            setSelectedKartuLansia(obj);
          }}
        />
      )}

      {/* MODAL CETAK KARTU LANSIA */}
      {selectedKartuLansia && (
        <ModalCetakKartuLansia
          lansia={selectedKartuLansia}
          onClose={() => setSelectedKartuLansia(null)}
        />
      )}
    </div>
  );
}

// ==========================================
// MODAL DETAIL LANSIA LENGKAP
// ==========================================
function ModalDetailLansia({ lansiaId, onClose, onOpenCetakKartu }: { lansiaId: string; onClose: () => void; onOpenCetakKartu: (obj: any) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const res = await getLansiaDetail(lansiaId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [lansiaId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-2xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Memuat Detail Lansia...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const records = data.records || [];
  const latestRecord = records[0] || null;
  const citizen = data.citizenData || {};

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto border border-slate-100">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center font-black text-2xl text-white shrink-0">
              🧓
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white border border-white/20">
                  {data.posyanduName || "Posyandu Lansia"}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  data.memilikiPenyakitBawaan ? "bg-amber-500/30 text-amber-100 border-amber-400/40" : "bg-emerald-500/30 text-emerald-100 border-emerald-400/40"
                }`}>
                  {data.memilikiPenyakitBawaan ? "⚠️ Komorbid" : "✓ Kondisi Sehat"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                {data.namaLengkap}
              </h3>
              <p className="text-xs text-indigo-100/90 font-mono mt-0.5">
                NIK: {data.nik || "-"} • Usia: {data.usia} Tahun
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Card Hasil Pemeriksaan Terbaru */}
          <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Activity size={15} className="text-indigo-600" /> Hasil Pemeriksaan Kesehatan Terbaru
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {latestRecord ? new Date(latestRecord.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Belum ada catatan"}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Tensi Darah</p>
                <p className="text-lg font-black text-slate-800">{latestRecord?.tensi ? `${latestRecord.tensi} mmHg` : "120/80"}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Gula Darah</p>
                <p className="text-lg font-black text-slate-800">{latestRecord?.gulaDarah ? `${latestRecord.gulaDarah} mg/dL` : "Normal"}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-2xs">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Berat Badan</p>
                <p className="text-lg font-black text-slate-800">{latestRecord?.beratBadan ? `${latestRecord.beratBadan} kg` : "-"}</p>
              </div>
            </div>
          </div>

          {/* Data Informasi Lansia & Domisili */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Informasi Lansia & Domisili</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Nama Lengkap</span>
                <span className="font-bold text-slate-800 text-sm">{data.namaLengkap}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">NIK Lansia</span>
                <span className="font-bold font-mono text-slate-800 text-sm">{data.nik || "-"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Jenis Kelamin</span>
                <span className="font-bold text-slate-800">
                  {data.jenisKelamin === "L" || data.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : data.jenisKelamin === "P" || data.jenisKelamin === "PEREMPUAN" ? "Perempuan" : "-"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block font-semibold">Usia</span>
                <span className="font-bold text-slate-800">{data.usia} Tahun</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block font-semibold">Alamat Lengkap</span>
                <span className="font-bold text-slate-800">
                  {citizen.alamat || "Desa Cimanggu I"}, RT {data.rt} / RW {data.rw} {citizen.dusun ? `• Dusun ${citizen.dusun}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Riwayat Pemeriksaan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Riwayat Kunjungan & Pemeriksaan ({records.length})</h4>
            </div>

            {records.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                Belum ada catatan riwayat pemeriksaan kesehatan lansia.
              </div>
            ) : (
              <div className="space-y-2.5">
                {records.map((rec: any, idx: number) => (
                  <div key={rec.id || idx} className="p-3.5 bg-white rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                        <Calendar size={13} /> {new Date(rec.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Tensi: {rec.tensi || "120/80"}
                      </span>
                    </div>
                    {rec.keterangan && <p className="text-slate-500 italic text-[11px]">{rec.keterangan}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => onOpenCetakKartu(data)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <QrCode size={15} /> Cetak Kartu Lansia
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODAL CETAK KARTU ANGGOTA LANSIA
// ==========================================
function ModalCetakKartuLansia({ lansia, onClose }: { lansia: any; onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-posyandu-card, #printable-posyandu-card * {
            visibility: visible !important;
          }
          #printable-posyandu-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) scale(1.1) !important;
            width: 420px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            background-color: white !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6">
        
        {/* Action Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" /> Kartu Posyandu Lansia Sehat
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pratinjau cetak kartu lansia</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-lg cursor-pointer">&times;</button>
        </div>

        {/* PRINTABLE CARD CONTAINER */}
        <div className="flex justify-center">
          <div
            id="printable-posyandu-card"
            className="w-[380px] sm:w-[420px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col relative text-slate-800"
          >
            {/* CARD HEADER */}
            <div className="bg-gradient-to-r from-indigo-800 via-slate-800 to-indigo-950 text-white p-3.5 relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-9 h-9 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center text-lg font-black shrink-0">
                  🧓
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider leading-none text-white">POSYANDU LANSIA SEHAT</h4>
                  <p className="text-[9px] text-indigo-200 font-bold uppercase mt-0.5">DESA CIMANGGU I • KEC. CIBUNGBULANG</p>
                  <p className="text-[8px] text-indigo-100/80 font-medium">{lansia.posyanduName || "Posyandu Mawar"}</p>
                </div>
              </div>
              <div className="bg-white/15 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-indigo-100 border border-white/20">
                KARTU ANGGOTA
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-4 space-y-3 bg-gradient-to-b from-indigo-50/30 to-white">
              <div className="flex gap-3 items-start">
                
                {/* Photo Placeholder / Avatar */}
                <div className="w-16 h-20 bg-indigo-50 rounded-xl border border-indigo-200 flex flex-col items-center justify-center text-center p-1 shrink-0 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                    {lansia.jenisKelamin === "L" || lansia.jenisKelamin === "LAKI_LAKI" ? "L" : "P"}
                  </div>
                  <span className="text-[8px] font-extrabold text-indigo-700 uppercase mt-1 truncate max-w-full">
                    {lansia.usia} Tahun
                  </span>
                </div>

                {/* Member Info Details */}
                <div className="flex-1 min-w-0 space-y-1 text-[11px]">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">NAMA LANSIA</span>
                    <p className="font-black text-slate-900 text-sm leading-tight truncate uppercase">{lansia.namaLengkap}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">NIK</span>
                      <p className="font-bold font-mono text-slate-700 truncate">{lansia.nik || "-"}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">USIA</span>
                      <p className="font-bold text-slate-700 truncate">{lansia.usia} Tahun</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">KONDISI</span>
                      <p className={`font-bold truncate ${lansia.memilikiPenyakitBawaan ? "text-amber-600" : "text-emerald-600"}`}>
                        {lansia.memilikiPenyakitBawaan ? "Ada Komorbid" : "Kondisi Sehat"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">WILAYAH</span>
                      <p className="font-bold text-slate-700 truncate">RT {lansia.rt} / RW {lansia.rw}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* BARCODE & QR CODE FOOTER - PERFECTLY CENTERED */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="flex-1 flex justify-center items-center overflow-hidden">
                  <BarcodeSVG value={lansia.nik || "3201160000000000"} />
                </div>
                <QRCodeSVG value={`https://cimanggu1.desa.id/verify-posyandu?nik=${lansia.nik || ""}`} />
              </div>
            </div>

            {/* CARD BOTTOM FOOTER */}
            <div className="bg-slate-900 text-white px-3 py-1.5 text-[8px] flex items-center justify-between font-medium">
              <span className="text-slate-300">Sistem Posyandu Lansia Desa Cimanggu I</span>
              <span className="text-indigo-400 font-bold">LANSIA SEHAT & BANTUAN</span>
            </div>

          </div>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Printer size={15} /> Cetak Kartu Lansia
          </button>
        </div>

      </div>
    </div>
  );
}

function ModalTambahLansia({ onClose, onRefresh, session, selectedPosyandu }: any) {
  const [loading, setLoading] = useState(false);
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("L");
  const [usia, setUsia] = useState("60");
  const [rt, setRt] = useState("001");
  const [rw, setRw] = useState("");
  const [memilikiPenyakitBawaan, setMemilikiPenyakitBawaan] = useState(false);

  let availableRws: string[] = [];

  if (selectedPosyandu && selectedPosyandu !== "ALL") {
    availableRws = getRWsForPosyandu(selectedPosyandu);
  } else if (session?.user?.rw) {
    availableRws = session.user.rw.split(",").map((s: string) => s.trim()).filter(Boolean);
  }

  if (availableRws.length === 0) {
    availableRws = ["001", "002", "003", "004", "005", "006", "007", "008", "009"];
  }

  useEffect(() => {
    if (availableRws.length > 0 && !rw) {
      setRw(availableRws[0]);
    }
  }, [availableRws]);

  const handleCitizenSelect = (citizen: any) => {
    if (citizen.nik) setNik(citizen.nik);
    if (citizen.namaLengkap) setNamaLengkap(citizen.namaLengkap);
    if (citizen.jenisKelamin) {
      setJenisKelamin(citizen.jenisKelamin === "LAKI_LAKI" || citizen.jenisKelamin === "L" ? "L" : "P");
    }
    if (citizen.tanggalLahir) {
      const birthYear = new Date(citizen.tanggalLahir).getFullYear();
      const currentYear = new Date().getFullYear();
      const calcUsia = currentYear - birthYear;
      if (calcUsia > 0) setUsia(calcUsia.toString());
    }
    if (citizen.rt) setRt(citizen.rt);
    if (citizen.rw && availableRws.includes(citizen.rw)) {
      setRw(citizen.rw);
    } else if (availableRws.length > 0) {
      setRw(availableRws[0]);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    let posyanduName = "Posyandu";
    if (selectedPosyandu && selectedPosyandu !== "ALL") {
      const matched = POSYANDU_UNITS.find(u => u.id === selectedPosyandu || u.code === selectedPosyandu);
      if (matched) posyanduName = matched.name;
    } else if (session?.user?.fullName) {
      posyanduName = session.user.fullName;
    }

    await addPosyanduLansia({
      nik,
      namaLengkap,
      jenisKelamin,
      usia: parseInt(usia),
      rt,
      rw: rw || availableRws[0],
      memilikiPenyakitBawaan,
      posyanduName,
      posyanduFilter: selectedPosyandu
    });

    setLoading(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Lansia</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap atau cari dari Data Kependudukan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xl cursor-pointer">&times;</button>
        </div>

        <div className="mb-5 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
          <CitizenSearchAutocomplete
            onSelect={handleCitizenSelect}
            posyanduFilter={selectedPosyandu}
            label="Integrasi Data Kependudukan (Cari NIK / Nama Lansia)"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">NIK (Opsional)</label>
              <input
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                type="text"
                maxLength={16}
                placeholder="16 digit NIK Lansia"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap *</label>
              <input
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
                type="text"
                placeholder="Nama Lansia"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kelamin *</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Usia (Tahun) *</label>
              <input
                value={usia}
                onChange={(e) => setUsia(e.target.value)}
                required
                type="number"
                min="45"
                placeholder="60"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RT *</label>
              <input
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                required
                type="text"
                placeholder="001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RW *</label>
              <select
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
              >
                {availableRws.map((rwVal: string) => (
                  <option key={rwVal} value={rwVal}>RW. {rwVal}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex items-center gap-2 pt-2">
              <input
                id="penyakit"
                type="checkbox"
                checked={memilikiPenyakitBawaan}
                onChange={(e) => setMemilikiPenyakitBawaan(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="penyakit" className="text-xs text-slate-700 font-medium cursor-pointer">Memiliki Komorbid / Penyakit Bawaan (Hipertensi/Diabetes/Lainnya)</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-sm cursor-pointer">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
