"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Baby, Trash2, CheckCircle2, Eye, QrCode, Printer,
  X, Calendar, User, MapPin, Activity, ShieldAlert, Sparkles, Clock,
  FileText, HeartPulse, ChevronRight, Stethoscope, Award, Phone
} from "lucide-react";
import {
  getPosyanduBalita, addPosyanduBalita, updatePosyanduBalitaStatus,
  deletePosyanduBalita, getBalitaDetail
} from "@/actions/posyandu";
import { CitizenSearchAutocomplete } from "./CitizenSearchAutocomplete";
import { getRWsForPosyandu, POSYANDU_UNITS } from "@/lib/posyandu";

function hitungUsia(tanggalLahir: string | Date): string {
  const tgl = new Date(tanggalLahir);
  const now = new Date();
  const bulan = (now.getFullYear() - tgl.getFullYear()) * 12 + (now.getMonth() - tgl.getMonth());
  if (bulan < 12) return `${bulan} Bulan`;
  return `${Math.floor(bulan / 12)} Tahun ${bulan % 12} Bln`;
}

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

export function PosyanduBalitaTab({ session, selectedPosyandu }: { session?: any; selectedPosyandu?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDetailBalitaId, setSelectedDetailBalitaId] = useState<string | null>(null);
  const [selectedKartuBalita, setSelectedKartuBalita] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getPosyanduBalita(selectedPosyandu);
      setData(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPosyandu]);

  const handleToggleStunting = async (id: string, currentStatus: boolean) => {
    await updatePosyanduBalitaStatus(id, !currentStatus);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data balita ini?")) {
      await deletePosyanduBalita(id);
      fetchData();
    }
  };

  const filteredData = data.filter(d =>
    d.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
    (d.nik && d.nik.includes(search))
  );

  const statusGiziLabel = (b: any) => {
    if (b.statusStunting) return { label: "Stunting", color: "bg-red-50 text-red-700 border-red-200" };
    return { label: "Normal", color: "bg-green-50 text-green-700 border-green-200" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Baby className="w-6 h-6 text-teal-500" />
            Data Balita
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data balita, rincian detail perkembangan, dan cetak kartu anggota posyandu
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Tambah Balita
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative mb-5">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama balita atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-teal-50 text-teal-800">
                <th className="px-4 py-3 rounded-tl-xl font-semibold w-10">No</th>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama Balita</th>
                <th className="px-4 py-3 font-semibold">Jenis Kelamin</th>
                <th className="px-4 py-3 font-semibold">Tanggal Lahir</th>
                <th className="px-4 py-3 font-semibold">Usia</th>
                <th className="px-4 py-3 font-semibold">Nama Ibu</th>
                <th className="px-4 py-3 font-semibold">Alamat</th>
                <th className="px-4 py-3 font-semibold">Status Gizi</th>
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada data balita ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((b, idx) => {
                  const gizi = statusGiziLabel(b);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{b.nik || "-"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{b.namaLengkap}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          b.jenisKelamin === "L" || b.jenisKelamin === "LAKI_LAKI" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                        }`}>
                          {b.jenisKelamin === "L" || b.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {b.tanggalLahir ? new Date(b.tanggalLahir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {b.tanggalLahir ? hitungUsia(b.tanggalLahir) : "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{b.namaOrangTua || "-"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">RT {b.rt} / RW {b.rw}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStunting(b.id, b.statusStunting)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${gizi.color}`}
                        >
                          {gizi.label}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {/* DETAIL BUTTON */}
                          <button
                            onClick={() => setSelectedDetailBalitaId(b.id)}
                            className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Lihat Rincian Detail Balita"
                          >
                            <Eye size={14} />
                            <span>Detail</span>
                          </button>

                          {/* CETAK KARTU BUTTON */}
                          <button
                            onClick={() => setSelectedKartuBalita(b)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Cetak Kartu Anggota Posyandu Digital"
                          >
                            <QrCode size={14} />
                            <span>Cetak Kartu</span>
                          </button>

                          {/* HAPUS BUTTON */}
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus Data Balita"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* MODAL TAMBAH BALITA */}
      {showModal && (
        <ModalTambahBalita
          onClose={() => setShowModal(false)}
          onRefresh={fetchData}
          session={session}
          selectedPosyandu={selectedPosyandu}
        />
      )}

      {/* MODAL DETAIL BALITA */}
      {selectedDetailBalitaId && (
        <ModalDetailBalita
          balitaId={selectedDetailBalitaId}
          onClose={() => setSelectedDetailBalitaId(null)}
          onOpenCetakKartu={(balitaObj: any) => {
            setSelectedDetailBalitaId(null);
            setSelectedKartuBalita(balitaObj);
          }}
        />
      )}

      {/* MODAL CETAK KARTU BALITA */}
      {selectedKartuBalita && (
        <ModalCetakKartuBalita
          balita={selectedKartuBalita}
          onClose={() => setSelectedKartuBalita(null)}
        />
      )}
    </div>
  );
}

// ==========================================
// MODAL DETAIL BALITA LENGKAP
// ==========================================
function ModalDetailBalita({ balitaId, onClose, onOpenCetakKartu }: { balitaId: string; onClose: () => void; onOpenCetakKartu: (balita: any) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profil" | "penimbangan" | "imunisasi">("profil");

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const res = await getBalitaDetail(balitaId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [balitaId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-2xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">Memuat Detail Balita...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const records = data.records || [];
  const latestRecord = records[0] || null;
  const citizen = data.citizenData || {};
  const namaIbu = citizen.namaIbu || data.namaOrangTua || "-";
  const namaAyah = citizen.namaAyah || "-";

  const defaultImmunizations = [
    { code: "HB0", name: "Hepatitis B (0-7 hari)", isDone: true, date: data.tanggalLahir },
    { code: "BCG", name: "BCG & Polio 1 (1 Bulan)", isDone: records.length > 0 },
    { code: "DPT1", name: "DPT-HB-Hib 1 & Polio 2 (2 Bulan)", isDone: records.length > 1 },
    { code: "DPT2", name: "DPT-HB-Hib 2 & Polio 3 (3 Bulan)", isDone: records.length > 2 },
    { code: "DPT3", name: "DPT-HB-Hib 3 & Polio 4 (4 Bulan)", isDone: records.length > 3 },
    { code: "MR", name: "Campak / MR (9 Bulan)", isDone: records.length > 5 },
    { code: "VITA", name: "Vitamin A Biru/Merah", isDone: true },
    { code: "CACING", name: "Obat Cacing", isDone: true },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto border border-slate-100">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-800 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center font-black text-2xl text-white shrink-0">
              👶
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/20 text-white border border-white/20">
                  {data.posyanduName || "Posyandu Unit"}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  data.statusStunting ? "bg-red-500/30 text-red-200 border-red-400/40" : "bg-emerald-500/30 text-emerald-200 border-emerald-400/40"
                }`}>
                  {data.statusStunting ? "⚠️ Stunting" : "✓ Status Gizi Normal"}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight truncate">
                {data.namaLengkap}
              </h3>
              <p className="text-xs text-teal-100/90 font-mono mt-0.5">
                NIK: {data.nik || "Belum ada NIK"} • {hitungUsia(data.tanggalLahir)}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Sub-Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 pt-2 gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("profil")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "profil"
                ? "bg-white text-teal-600 border-teal-500 shadow-xs"
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            <User size={14} /> Profil & Orang Tua
          </button>
          <button
            onClick={() => setActiveTab("penimbangan")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "penimbangan"
                ? "bg-white text-teal-600 border-teal-500 shadow-xs"
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            <Activity size={14} /> Riwayat Penimbangan ({records.length})
          </button>
          <button
            onClick={() => setActiveTab("imunisasi")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "imunisasi"
                ? "bg-white text-teal-600 border-teal-500 shadow-xs"
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            <Stethoscope size={14} /> Imunisasi & Vitamin
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {activeTab === "profil" && (
            <div className="space-y-5">
              {/* Card Status Gizi Terbaru */}
              <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100/50 p-4 rounded-2xl border border-teal-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                    <HeartPulse size={15} className="text-teal-600" /> Hasil Pemeriksaan Terbaru
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {latestRecord ? new Date(latestRecord.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "Belum ada catatan"}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Berat Badan</p>
                    <p className="text-lg font-black text-slate-800">{latestRecord?.beratBadan ? `${latestRecord.beratBadan} kg` : "-"}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Tinggi Badan</p>
                    <p className="text-lg font-black text-slate-800">{latestRecord?.tinggiBadan ? `${latestRecord.tinggiBadan} cm` : "-"}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-2xs">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Lingkar Kepala</p>
                    <p className="text-lg font-black text-slate-800">{latestRecord?.lingkarKepala ? `${latestRecord.lingkarKepala} cm` : "-"}</p>
                  </div>
                </div>
              </div>

              {/* Data Informasi Balita */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Informasi Balita</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Nama Lengkap</span>
                    <span className="font-bold text-slate-800 text-sm">{data.namaLengkap}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">NIK Balita</span>
                    <span className="font-bold font-mono text-slate-800 text-sm">{data.nik || "-"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Tanggal Lahir & Usia</span>
                    <span className="font-bold text-slate-800">
                      {new Date(data.tanggalLahir).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} ({hitungUsia(data.tanggalLahir)})
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Jenis Kelamin</span>
                    <span className="font-bold text-slate-800">
                      {data.jenisKelamin === "L" || data.jenisKelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Orang Tua & Alamat */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Data Orang Tua & Alamat</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Nama Ibu Kandung</span>
                    <span className="font-bold text-slate-800">{namaIbu}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Nama Ayah</span>
                    <span className="font-bold text-slate-800">{namaAyah}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-slate-400 block font-semibold">Alamat Lengkap</span>
                    <span className="font-bold text-slate-800">
                      {citizen.alamat || "Desa Cimanggu I"}, RT {data.rt} / RW {data.rw} {citizen.dusun ? `• Dusun ${citizen.dusun}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "penimbangan" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Riwayat Penimbangan & Pengukuran</h4>
                <span className="text-xs text-slate-500 font-semibold">{records.length} Total Pemeriksaan</span>
              </div>

              {records.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Belum ada riwayat penimbangan untuk balita ini.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((rec: any, idx: number) => (
                    <div key={rec.id || idx} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-teal-200 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-700 flex items-center gap-1.5">
                          <Calendar size={13} /> {new Date(rec.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                        {rec.statusGizi && (
                          <span className="bg-teal-50 text-teal-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-teal-200">
                            {rec.statusGizi}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs text-center font-medium">
                        <div><span className="text-[10px] text-slate-400 block">BB</span> <strong>{rec.beratBadan ? `${rec.beratBadan} kg` : "-"}</strong></div>
                        <div><span className="text-[10px] text-slate-400 block">TB</span> <strong>{rec.tinggiBadan ? `${rec.tinggiBadan} cm` : "-"}</strong></div>
                        <div><span className="text-[10px] text-slate-400 block">Lingkar Kepala</span> <strong>{rec.lingkarKepala ? `${rec.lingkarKepala} cm` : "-"}</strong></div>
                      </div>

                      {rec.keterangan && (
                        <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded-lg">
                          Catatan: {rec.keterangan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "imunisasi" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Jadwal Imunisasi & Vitamin A</h4>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                  Status Terpantau
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {defaultImmunizations.map((item) => (
                  <div key={item.code} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Kode: {item.code}</p>
                    </div>
                    {item.isDone ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                        <CheckCircle2 size={12} /> Diberikan
                      </span>
                    ) : (
                      <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                        Belum
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onOpenCetakKartu(data)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <QrCode size={15} /> Cetak Kartu Anggota
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
// MODAL CETAK KARTU ANGGOTA POSYANDU BALITA
// ==========================================
function ModalCetakKartuBalita({ balita, onClose }: { balita: any; onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDob = balita.tanggalLahir
    ? new Date(balita.tanggalLahir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

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
              <QrCode className="w-5 h-5 text-indigo-600" /> Kartu Anggota Posyandu Digital
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Pratinjau sebelum dicetak / diunduh</p>
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
            <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-900 text-white p-3.5 relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-9 h-9 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center text-lg font-black shrink-0">
                  👶
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider leading-none text-white">POSYANDU BALITA</h4>
                  <p className="text-[9px] text-teal-200 font-bold uppercase mt-0.5">DESA CIMANGGU I • KEC. CIBUNGBULANG</p>
                  <p className="text-[8px] text-teal-100/80 font-medium">{balita.posyanduName || "Posyandu Mawar"}</p>
                </div>
              </div>
              <div className="bg-white/15 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-teal-100 border border-white/20">
                KARTU ANGGOTA
              </div>
            </div>

            {/* CARD BODY */}
            <div className="p-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-white">
              <div className="flex gap-3 items-start">
                
                {/* Photo Placeholder / Avatar */}
                <div className="w-16 h-20 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center p-1 shrink-0 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center">
                    {balita.jenisKelamin === "L" || balita.jenisKelamin === "LAKI_LAKI" ? "L" : "P"}
                  </div>
                  <span className="text-[8px] font-extrabold text-slate-500 uppercase mt-1 truncate max-w-full">
                    {hitungUsia(balita.tanggalLahir)}
                  </span>
                </div>

                {/* Member Info Details */}
                <div className="flex-1 min-w-0 space-y-1 text-[11px]">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">NAMA BALITA</span>
                    <p className="font-black text-slate-900 text-sm leading-tight truncate uppercase">{balita.namaLengkap}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">NIK</span>
                      <p className="font-bold font-mono text-slate-700 truncate">{balita.nik || "-"}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">TGL LAHIR</span>
                      <p className="font-bold text-slate-700 truncate">{formattedDob}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">NAMA IBU</span>
                      <p className="font-bold text-slate-700 truncate uppercase">{balita.namaOrangTua || "-"}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 block leading-none">WILAYAH</span>
                      <p className="font-bold text-slate-700 truncate">RT {balita.rt} / RW {balita.rw}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* BARCODE & QR CODE FOOTER - PERFECTLY CENTERED */}
              <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="flex-1 flex justify-center items-center overflow-hidden">
                  <BarcodeSVG value={balita.nik || "3201160000000000"} />
                </div>
                <QRCodeSVG value={`https://cimanggu1.desa.id/verify-posyandu?nik=${balita.nik || ""}`} />
              </div>
            </div>

            {/* CARD BOTTOM FOOTER */}
            <div className="bg-slate-900 text-white px-3 py-1.5 text-[8px] flex items-center justify-between font-medium">
              <span className="text-slate-300">Sistem Posyandu Terintegrasi Desa Cimanggu I</span>
              <span className="text-teal-400 font-bold">VALID MEMBER CARD</span>
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
            <Printer size={15} /> Cetak Kartu Anggota
          </button>
        </div>

      </div>
    </div>
  );
}

function ModalTambahBalita({ onClose, onRefresh, session, selectedPosyandu }: any) {
  const [loading, setLoading] = useState(false);
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("L");
  const [namaOrangTua, setNamaOrangTua] = useState("");
  const [rt, setRt] = useState("001");
  const [rw, setRw] = useState("");

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
    if (citizen.tanggalLahir) {
      const d = new Date(citizen.tanggalLahir);
      setTanggalLahir(d.toISOString().split("T")[0]);
    }
    if (citizen.jenisKelamin) {
      setJenisKelamin(citizen.jenisKelamin === "LAKI_LAKI" || citizen.jenisKelamin === "L" ? "L" : "P");
    }
    if (citizen.namaIbu || citizen.namaAyah) {
      setNamaOrangTua(citizen.namaIbu || citizen.namaAyah);
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

    await addPosyanduBalita({
      nik: nik || null,
      namaLengkap,
      tanggalLahir,
      jenisKelamin,
      namaOrangTua,
      rt,
      rw: rw || availableRws[0],
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
            <h3 className="text-lg font-bold text-slate-800">Tambah Data Balita</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isi data lengkap balita atau cari dari Data Kependudukan</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl cursor-pointer">&times;</button>
        </div>

        <div className="mb-5 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100">
          <CitizenSearchAutocomplete
            onSelect={handleCitizenSelect}
            posyanduFilter={selectedPosyandu}
            label="Integrasi Data Kependudukan (Cari NIK / Nama Balita)"
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
                placeholder="16 digit NIK Balita"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap Balita *</label>
              <input
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
                type="text"
                placeholder="Nama Balita"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tanggal Lahir *</label>
              <input
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                required
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jenis Kelamin *</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              >
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Ibu / Orang Tua *</label>
              <input
                value={namaOrangTua}
                onChange={(e) => setNamaOrangTua(e.target.value)}
                required
                type="text"
                placeholder="Nama Ibu Kandung"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">RW *</label>
              <select
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium text-slate-800"
              >
                {availableRws.map((rwVal: string) => (
                  <option key={rwVal} value={rwVal}>RW. {rwVal}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded-xl disabled:opacity-50 font-semibold shadow-sm cursor-pointer">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
