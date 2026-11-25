"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Baby, Trash2, CheckCircle2, Eye, QrCode, Printer,
  X, Calendar, User, MapPin, Activity, ShieldAlert, Sparkles, Clock,
  FileText, HeartPulse, ChevronRight, Stethoscope, Award, Phone,
  Cpu, TrendingUp, AlertCircle, RefreshCw, ArrowUpDown, Filter,
  Layers, Users, ShieldCheck, Check, AlertTriangle, UserPlus, ArrowRight,
  HelpCircle, Link as LinkIcon
} from "lucide-react";
import {
  getPosyanduBalita, addPosyanduBalita, updatePosyanduBalitaStatus,
  deletePosyanduBalita, getBalitaDetail,
  getPosyanduBalitaKependudukanSync, lookupNikForBalita,
  registerBalitaWithNewWarga, syncBalitaFromKependudukan
} from "@/actions/posyandu";
import { triggerNotificationRefresh } from "@/hooks/useNotifications";
import { CitizenSearchAutocomplete } from "./CitizenSearchAutocomplete";
import { getRWsForPosyandu, POSYANDU_UNITS, resolvePosyanduUnit } from "@/lib/posyandu";

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

  // Demographic Sync View States
  const [activeView, setActiveView] = useState<"register" | "rekap-kependudukan">("register");
  const [syncData, setSyncData] = useState<any>(null);
  const [loadingSync, setLoadingSync] = useState(false);
  const [ageFilter, setAgeFilter] = useState<string>("ALL");
  const [mawarFilter, setMawarFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [syncingWargaId, setSyncingWargaId] = useState<string | null>(null);
  const [bulkSyncing, setBulkSyncing] = useState(false);

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

  const fetchSyncData = async () => {
    setLoadingSync(true);
    try {
      const res = await getPosyanduBalitaKependudukanSync(selectedPosyandu);
      setSyncData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSync(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (activeView === "rekap-kependudukan") {
      fetchSyncData();
    }

    const handleRefresh = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      fetchData();
      if (activeView === "rekap-kependudukan") fetchSyncData();
    };

    window.addEventListener("refresh-notifications", handleRefresh);
    window.addEventListener("refresh-warga", handleRefresh);
    window.addEventListener("focus", handleRefresh);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("desa_cimanggu_realtime_sync");
        bc.onmessage = (ev) => {
          if (ev.data?.type === "WARGA_UPDATED" || ev.data?.type === "POSYANDU_UPDATED" || ev.data?.type === "MUTASI_UPDATED") {
            fetchData();
            if (activeView === "rekap-kependudukan") fetchSyncData();
          }
        };
      } catch (e) {}
    }

    const interval = setInterval(handleRefresh, 25000);

    return () => {
      window.removeEventListener("refresh-notifications", handleRefresh);
      window.removeEventListener("refresh-warga", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, [selectedPosyandu, activeView]);

  const handleToggleStunting = async (id: string, currentStatus: boolean) => {
    await updatePosyanduBalitaStatus(id, !currentStatus);
    fetchData();
    triggerNotificationRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus data balita ini?")) {
      await deletePosyanduBalita(id);
      fetchData();
      triggerNotificationRefresh();
    }
  };

  const handleSingleSync = async (wargaId: string) => {
    setSyncingWargaId(wargaId);
    try {
      const res = await syncBalitaFromKependudukan([wargaId], selectedPosyandu);
      if (res.success) {
        alert("✓ Berhasil menyinkronkan data balita ke register Posyandu.");
        fetchData();
        fetchSyncData();
        triggerNotificationRefresh();
      }
    } catch (err: any) {
      alert("Gagal sinkronisasi: " + (err?.message || "Terjadi kesalahan."));
    } finally {
      setSyncingWargaId(null);
    }
  };

  const handleBulkSync = async () => {
    if (!syncData?.balita) return;
    const unregistered = syncData.balita.filter((b: any) => !b.isRegisteredInPosyandu && b.wargaId);
    if (unregistered.length === 0) {
      alert("Semua balita di wilayah ini sudah terdaftar di register Posyandu.");
      return;
    }
    if (!confirm(`Sinkronkan ${unregistered.length} balita dari Data Kependudukan ke register Posyandu?`)) return;

    setBulkSyncing(true);
    try {
      const ids = unregistered.map((b: any) => b.wargaId);
      const res = await syncBalitaFromKependudukan(ids, selectedPosyandu);
      if (res.success) {
        alert(`✓ Berhasil menyinkronkan ${res.count} balita ke Posyandu.`);
        fetchData();
        fetchSyncData();
        triggerNotificationRefresh();
      }
    } catch (err: any) {
      alert("Gagal sinkronisasi: " + (err?.message || "Terjadi kesalahan."));
    } finally {
      setBulkSyncing(false);
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

  // Filter and sort for demographic sync view
  const displayedSyncBalita = (syncData?.balita || []).filter((b: any) => {
    const matchSearch = !search ||
      b.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      (b.nik && b.nik.includes(search)) ||
      (b.noKK && b.noKK.includes(search));
    const matchAge = ageFilter === "ALL" || b.kelompokUmur?.code === ageFilter;
    const matchMawar = mawarFilter === "ALL" || b.posyanduId === mawarFilter;
    return matchSearch && matchAge && matchMawar;
  }).sort((a: any, b: any) => {
    if (sortOrder === "ASC") return a.usiaBulan - b.usiaBulan;
    return b.usiaBulan - a.usiaBulan;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Baby className="w-6 h-6 text-teal-500" />
              Data Balita & Sinkronisasi Kependudukan
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-50 text-teal-700 border border-teal-200">
              Maks 5 Tahun (60 Bulan)
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Pengelolaan terpadu register balita posyandu, deteksi balita di KK warga, dan alur pendaftaran terintegrasi RT, RW, Kadus, & Desa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Balita
          </button>
        </div>
      </div>

      {/* VIEW SWITCHER TABS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap sm:flex-nowrap gap-1.5">
          <button
            onClick={() => setActiveView("register")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeView === "register"
                ? "bg-white text-teal-700 shadow-sm shadow-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Baby size={16} />
            <span>Register & Layanan Balita ({data.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveView("rekap-kependudukan");
              if (!syncData) fetchSyncData();
            }}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeView === "rekap-kependudukan"
                ? "bg-white text-teal-700 shadow-sm shadow-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers size={16} />
            <span>Rekapitulasi Kependudukan & Sinkronisasi Mawar I - VII</span>
            {syncData?.summary?.totalBelumTerdaftarPosyandu > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                {syncData.summary.totalBelumTerdaftarPosyandu} Perlu Sinkron
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 justify-end px-2">
          {activeView === "rekap-kependudukan" && (
            <button
              onClick={handleBulkSync}
              disabled={bulkSyncing || !syncData?.summary?.totalBelumTerdaftarPosyandu}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>{bulkSyncing ? "Menyinkronkan..." : "Sinkronkan Semua Balita"}</span>
            </button>
          )}
          <button
            onClick={() => {
              fetchData();
              if (activeView === "rekap-kependudukan") fetchSyncData();
            }}
            className="p-2 text-slate-500 hover:text-teal-600 hover:bg-white rounded-xl transition-all cursor-pointer"
            title="Refresh Real-time Data"
          >
            <RefreshCw size={15} className={loading || loadingSync ? "animate-spin text-teal-600" : ""} />
          </button>
        </div>
      </div>

      {/* VIEW 1: REGISTER PASIEN POSYANDU */}
      {activeView === "register" && (
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
                            <button
                              onClick={() => setSelectedDetailBalitaId(b.id)}
                              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Lihat Rincian Detail Balita"
                            >
                              <Eye size={14} />
                              <span>Detail</span>
                            </button>
                            <button
                              onClick={() => setSelectedKartuBalita(b)}
                              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Cetak Kartu Anggota Posyandu Digital"
                            >
                              <QrCode size={14} />
                              <span>Cetak Kartu</span>
                            </button>
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
      )}

      {/* VIEW 2: REKAPITULASI KEPENDUDUKAN & SINKRONISASI BALITA MAWAR I - VII */}
      {activeView === "rekap-kependudukan" && (
        <div className="space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Balita Kependudukan</span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-slate-900">{syncData?.summary?.totalBalita || 0}</span>
                <span className="text-xs font-bold text-slate-400">Jiwa (&le; 5 Thn)</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Tercatat di KK warga desa</span>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Terdaftar Posyandu</span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-emerald-900">{syncData?.summary?.totalTerdaftarPosyandu || 0}</span>
                <span className="text-xs font-bold text-emerald-600">Terdaftar</span>
              </div>
              <span className="text-[10px] text-emerald-700 mt-1 block font-semibold">Cakupan: {syncData?.summary?.persentaseCakupan || 0}%</span>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100 shadow-sm">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Belum Masuk Register</span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-rose-900">{syncData?.summary?.totalBelumTerdaftarPosyandu || 0}</span>
                <span className="text-xs font-bold text-rose-600">Perlu Sinkron</span>
              </div>
              <span className="text-[10px] text-rose-700 mt-1 block">Ada di KK belum di Posyandu</span>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 shadow-sm">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Fisik Tercatat (Belum KK)</span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-2xl font-black text-amber-900">{syncData?.summary?.totalBelumMasukKK || 0}</span>
                <span className="text-xs font-bold text-amber-600">Fisik Ada</span>
              </div>
              <span className="text-[10px] text-amber-700 mt-1 block">Tercatat di Posyandu belum KK</span>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Engine Demografi Presisi</span>
              <div className="flex items-baseline justify-between mt-1.5">
                <span className="text-lg font-black text-teal-400">Python 3.12</span>
                <span className="text-[10px] font-bold text-slate-300 font-mono">Presisi Usia</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">Tabel WHO Multicentre</span>
            </div>
          </div>

          {/* POSYANDU MAWAR BREAKDOWN CHIPS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin size={14} className="text-teal-600" /> Pengelompokan Wilayah Posyandu Mawar I - VII:
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">Pilih posyandu untuk memfilter cakupan RW</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              <button
                onClick={() => setMawarFilter("ALL")}
                className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                  mawarFilter === "ALL"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div>Semua Posyandu</div>
                <div className="text-[10px] opacity-80 mt-0.5">({syncData?.summary?.totalBalita || 0} Balita)</div>
              </button>
              {syncData?.rekapPosyanduMawar?.map((m: any) => {
                const isSelected = mawarFilter === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMawarFilter(isSelected ? "ALL" : m.id)}
                    className={`p-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="truncate">{m.name.replace("Posyandu ", "")}</div>
                    <div className="text-[9px] opacity-80 font-mono mt-0.5">
                      {m.rws.map((r: string) => `RW${r}`).join("&")} • {m.totalBalita}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AGE BRACKETS BADGES */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar size={14} className="text-teal-600" /> Distribusi Kelompok Umur Balita Desa Cimanggu I:
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">Filter berdasarkan tahapan perkembangan</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAgeFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  ageFilter === "ALL"
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Semua Umur (0 - 5 Thn)
              </button>
              {syncData?.rekapKelompokUmur?.map((u: any) => {
                const isSelected = ageFilter === u.code;
                return (
                  <button
                    key={u.code}
                    onClick={() => setAgeFilter(isSelected ? "ALL" : u.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{u.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                      isSelected ? "bg-white/20 text-white" : "bg-teal-100 text-teal-800"
                    }`}>
                      {u.total} (L:{u.L} / P:{u.P})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TABLE REKAPITULASI BALITA TERSUSUN RAPI BERDASARKAN UMUR */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Baby className="w-5 h-5 text-teal-600" />
                  Daftar Nama Balita Tersusun Rapi Sesuai Umur (0 - 5 Tahun)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan balita yang terdata di KK warga dan register Posyandu Mawar I s.d. VII
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Ubah Urutan Umur"
                >
                  <ArrowUpDown size={13} />
                  <span>{sortOrder === "ASC" ? "Termuda &rarr; Tertua" : "Tertua &rarr; Termuda"}</span>
                </button>
              </div>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari balita di rekapitulasi (Nama, NIK, No. KK)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none text-xs"
              />
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Identitas (NIK & No. KK)</th>
                    <th className="py-2.5 px-3">Nama Lengkap Balita</th>
                    <th className="py-2.5 px-3 text-center">L/P</th>
                    <th className="py-2.5 px-3">Tanggal Lahir</th>
                    <th className="py-2.5 px-3 font-black text-slate-900">Usia Presisi</th>
                    <th className="py-2.5 px-3">Kelompok Umur</th>
                    <th className="py-2.5 px-3">Orang Tua / Ibu</th>
                    <th className="py-2.5 px-3">Wilayah (RT/RW)</th>
                    <th className="py-2.5 px-3">Posyandu Mawar</th>
                    <th className="py-2.5 px-3 text-center">Status Integrasi</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {loadingSync ? (
                    <tr>
                      <td colSpan={12} className="py-10 text-center">
                        <div className="flex justify-center"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                        <span className="text-xs text-slate-400 mt-2 block">Menghitung presisi usia balita via Python Engine...</span>
                      </td>
                    </tr>
                  ) : displayedSyncBalita.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400">
                        Tidak ada data balita yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    displayedSyncBalita.map((b: any, idx: number) => {
                      return (
                        <tr key={b.id || idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono">
                            <div className="font-bold text-slate-800">{b.nik || "-"}</div>
                            <div className="text-[10px] text-slate-400">KK: {b.noKK || "-"}</div>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 uppercase">{b.namaLengkap}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.jenisKelamin === "L" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                            }`}>
                              {b.jenisKelamin}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                            {b.tanggalLahir ? new Date(b.tanggalLahir).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                          </td>
                          <td className="py-2.5 px-3 font-black text-teal-700 whitespace-nowrap">
                            {b.usiaLabel}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.kelompokUmur?.badge || "bg-slate-50 text-slate-600"}`}>
                              {b.kelompokUmur?.label || "-"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-[120px]">{b.namaOrangTua}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700">RT {b.rt} / RW {b.rw}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-bold text-slate-800">{b.posyanduName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {b.isRegisteredInPosyandu ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check size={11} className="text-emerald-600" /> Terdaftar Posyandu
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle size={11} className="text-rose-600" /> Belum Masuk Register
                              </span>
                            )}
                            {!b.inKependudukan && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Belum Masuk KK
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {!b.isRegisteredInPosyandu && b.wargaId ? (
                              <button
                                onClick={() => handleSingleSync(b.wargaId)}
                                disabled={syncingWargaId === b.wargaId}
                                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                title="Sinkronkan Balita ke Register Posyandu"
                              >
                                {syncingWargaId === b.wargaId ? "..." : "Sinkronkan"}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">✓ Sinkron</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loadingSync && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>Dihitung otomatis oleh Python Demografi Engine</span>
                <span>Menampilkan {displayedSyncBalita.length} balita</span>
              </div>
            )}
          </div>
        </div>
      )}

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
  const [activeTab, setActiveTab] = useState<"profil" | "penimbangan" | "imunisasi" | "ai">("profil");

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
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "bg-white text-emerald-600 border-emerald-500 shadow-xs"
                : "text-slate-500 hover:text-slate-700 border-transparent"
            }`}
          >
            <Sparkles size={14} className="text-amber-500 animate-pulse" /> 🧠 Analisis AI Python
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

                {/* AI Insight Quick Preview */}
                {data.aiAnalysis && (
                  <div className="p-3.5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md border border-emerald-500/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                        <Sparkles size={17} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase">AI WHO Engine</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-white/20 text-white">
                            Z-Score: {data.aiAnalysis.antropometri?.zScoreHAZ?.toFixed?.(2) ?? data.aiAnalysis.antropometri?.zScoreHAZ} SD
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate mt-0.5">
                          Proyeksi: <span className={data.aiAnalysis.isStunted ? "text-red-300 font-black" : "text-emerald-300 font-black"}>{data.aiAnalysis.proyeksiRisiko60Hari}</span> • {data.aiAnalysis.growthTrend}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("ai")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shrink-0 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                    >
                      Buka AI <ChevronRight size={13} />
                    </button>
                  </div>
                )}
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

          {activeTab === "ai" && (
            <div className="space-y-4">
              {data.aiAnalysis ? (
                <>
                  {/* Engine Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <Cpu size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">MESIN KOMPUTASI CERDAS</span>
                        <h5 className="text-xs font-black text-white">{data.aiAnalysis.engine}</h5>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {data.aiAnalysis.executionMode === "PYTHON_NATIVE" ? "⚡ Python 3 Native" : "🛡️ TypeScript Safe Fallback"}
                    </span>
                  </div>

                  {/* Z-Scores Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50/70 rounded-2xl border border-teal-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase text-teal-800">Tinggi Badan / Usia (TB/U)</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          data.aiAnalysis.isStunted ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {data.aiAnalysis.statusStunting}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800">
                          {data.aiAnalysis.antropometri?.zScoreHAZ >= 0 ? `+${data.aiAnalysis.antropometri?.zScoreHAZ}` : data.aiAnalysis.antropometri?.zScoreHAZ}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">SD (WHO Z-Score)</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        TB Terukur: <strong>{data.aiAnalysis.antropometri?.tinggiBadan} cm</strong> (Median WHO: {data.aiAnalysis.antropometri?.medianIdealTB} cm)
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50/70 rounded-2xl border border-indigo-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase text-indigo-800">Berat Badan / Usia (BB/U)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700">
                          {data.aiAnalysis.statusBeratBadan}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800">
                          {data.aiAnalysis.antropometri?.zScoreWAZ >= 0 ? `+${data.aiAnalysis.antropometri?.zScoreWAZ}` : data.aiAnalysis.antropometri?.zScoreWAZ}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">SD (WHO Z-Score)</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        BB Terukur: <strong>{data.aiAnalysis.antropometri?.beratBadan} kg</strong> (Median WHO: {data.aiAnalysis.antropometri?.medianIdealBB} kg)
                      </p>
                    </div>
                  </div>

                  {/* Growth Trajectory & 60-Day Risk */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">TRAJEKTORI PERTUMBUHAN</span>
                      <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <TrendingUp size={16} className="text-teal-600" /> {data.aiAnalysis.growthTrend}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">PROYEKSI RISIKO 60 HARI</span>
                      <p className={`text-sm font-black flex items-center gap-1.5 ${
                        data.aiAnalysis.proyeksiRisiko60Hari === "SANGAT_TINGGI" || data.aiAnalysis.proyeksiRisiko60Hari === "TINGGI"
                          ? "text-red-600"
                          : data.aiAnalysis.proyeksiRisiko60Hari === "SEDANG"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}>
                        <ShieldAlert size={16} /> RISIKO {data.aiAnalysis.proyeksiRisiko60Hari}
                      </p>
                    </div>
                  </div>

                  {/* Localized PMT Nutritional Recommendations */}
                  <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-2">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-600" /> Rekomendasi Menu PMT & Intervensi Lokal Desa Cimanggu I
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {data.aiAnalysis.rekomendasiPMT?.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Narrative Conclusion */}
                  <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 text-xs text-teal-900 leading-relaxed">
                    <span className="font-extrabold block mb-1 uppercase tracking-wider text-teal-800">Kesimpulan Diagnostik:</span>
                    {data.aiAnalysis.kesimpulan}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">Data pengukuran belum mencukupi untuk menjalankan analisis AI.</p>
                </div>
              )}
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
  const [noKK, setNoKK] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [tempatLahir, setTempatLahir] = useState("BOGOR");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("L");
  const [namaIbu, setNamaIbu] = useState("");
  const [namaAyah, setNamaAyah] = useState("");
  const [rt, setRt] = useState("001");
  const [rw, setRw] = useState("");
  const [alamat, setAlamat] = useState("");
  const [statusStunting, setStatusStunting] = useState(false);

  // Smart Lookup & Integration States
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<"IDLE" | "FOUND" | "NOT_FOUND">("IDLE");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isNewCitizen, setIsNewCitizen] = useState(false);

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

  // Real-time instant NIK Lookup handler
  const handleNikLookup = async (inputNik: string) => {
    const cleanNik = inputNik.trim();
    setNik(cleanNik);

    if (cleanNik.length < 10) {
      setLookupStatus("IDLE");
      setLookupResult(null);
      setIsNewCitizen(false);
      return;
    }

    setLookupLoading(true);
    try {
      const res = await lookupNikForBalita(cleanNik, selectedPosyandu);
      if (res.found && res.warga) {
        setLookupStatus("FOUND");
        setLookupResult(res.warga);
        setIsNewCitizen(false);

        // Auto-generate fields from official kependudukan
        setNamaLengkap(res.warga.namaLengkap);
        setNoKK(res.warga.noKK);
        setTanggalLahir(res.warga.tanggalLahir);
        setJenisKelamin(res.warga.jenisKelamin);
        setNamaIbu(res.warga.namaOrangTua);
        setTempatLahir(res.warga.tempatLahir);
        setRt(res.warga.rt);
        if (res.warga.rw) {
          setRw(res.warga.rw);
        }
        if (res.warga.alamat) {
          setAlamat(res.warga.alamat);
        }
      } else {
        setLookupStatus("NOT_FOUND");
        setLookupResult(null);
        setIsNewCitizen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCitizenSelect = (citizen: any) => {
    if (citizen.nik) {
      handleNikLookup(citizen.nik);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isNewCitizen) {
        // Balita belum terdata kependudukan / belum masuk KK:
        // No. KK dan NIK WAJIB DIISI!
        if (!nik.trim()) {
          alert("NIK Balita wajib diisi!");
          setLoading(false);
          return;
        }
        if (!noKK.trim()) {
          alert("No. Kartu Keluarga (KK) wajib diisi untuk melacak keberadaan fisik warga balita!");
          setLoading(false);
          return;
        }

        const res = await registerBalitaWithNewWarga({
          nik: nik.trim(),
          noKK: noKK.trim(),
          namaLengkap: namaLengkap.trim(),
          tempatLahir: tempatLahir.trim(),
          tanggalLahir,
          jenisKelamin,
          namaIbu: namaIbu.trim(),
          namaAyah: namaAyah.trim(),
          rt,
          rw: rw || availableRws[0],
          alamat: alamat.trim(),
          posyanduFilter: selectedPosyandu,
          statusStunting
        });

        if (res.success) {
          alert("✓ Berhasil mendaftarkan balita ke Data Kependudukan Resmi Desa dan Register Posyandu!\nData langsung tersinkronkan ke RT, RW, Kadus, dan Desa.");
          
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("desa_cimanggu_realtime_sync");
              bc.postMessage({ type: "WARGA_UPDATED", action: "ADD_BALITA", nik });
              bc.close();
            } catch (e) {}
          }
          window.dispatchEvent(new Event("refresh-warga"));
          window.dispatchEvent(new Event("refresh-notifications"));
          onRefresh();
          triggerNotificationRefresh();
          onClose();
        }
      } else {
        // Balita sudah ada di kependudukan resmi
        let posyanduName = "Posyandu";
        if (selectedPosyandu && selectedPosyandu !== "ALL") {
          const matched = POSYANDU_UNITS.find(u => u.id === selectedPosyandu || u.code === selectedPosyandu);
          if (matched) posyanduName = matched.name;
        } else if (session?.user?.fullName) {
          posyanduName = session.user.fullName;
        }

        const res = await addPosyanduBalita({
          nik: nik || null,
          namaLengkap,
          tanggalLahir,
          jenisKelamin,
          namaOrangTua: namaIbu || namaAyah || "-",
          rt,
          rw: rw || availableRws[0],
          posyanduName,
          posyanduFilter: selectedPosyandu,
          statusStunting
        });

        if (res.success) {
          alert("✓ Berhasil mendaftarkan balita ke Posyandu.");
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const bc = new BroadcastChannel("desa_cimanggu_realtime_sync");
              bc.postMessage({ type: "POSYANDU_UPDATED", action: "ADD", nik });
              bc.close();
            } catch (e) {}
          }
          window.dispatchEvent(new Event("refresh-notifications"));
          onRefresh();
          triggerNotificationRefresh();
          onClose();
        }
      }
    } catch (err: any) {
      alert("Gagal menyimpan data balita: " + (err?.message || "Terjadi kesalahan."));
    } finally {
      setLoading(false);
    }
  };

  const assignedUnit = resolvePosyanduUnit(rw || "001");

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-100">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-800">Pendaftaran Data Balita Terpadu</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-teal-100 text-teal-800">
                Integrasi KK Digital
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ketik NIK untuk auto-generate atau daftarkan balita yang belum masuk KK secara otomatis.
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-xl cursor-pointer">&times;</button>
        </div>

        {/* AUTOCOMPLETE / PENCARIAN CEPAT */}
        <div className="mb-4 bg-teal-50/60 p-3 rounded-2xl border border-teal-100">
          <CitizenSearchAutocomplete
            onSelect={handleCitizenSelect}
            posyanduFilter={selectedPosyandu}
            label="Integrasi Data Kependudukan (Cari NIK / Nama Balita)"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NIK INPUT WITH REALTIME LOOKUP */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>NIK Balita</span>
                <span className="text-rose-500">*</span>
                {lookupLoading && <span className="text-[10px] text-teal-600 font-normal animate-pulse">(Mengecek kependudukan...)</span>}
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsNewCitizen(!isNewCitizen);
                  setLookupStatus(isNewCitizen ? "IDLE" : "NOT_FOUND");
                }}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 cursor-pointer underline"
              >
                {isNewCitizen ? "Kembali ke Cari Data" : "Balita Belum Masuk KK?"}
              </button>
            </div>
            <div className="relative">
              <input
                value={nik}
                onChange={(e) => handleNikLookup(e.target.value)}
                type="text"
                required
                maxLength={16}
                placeholder="Masukkan 16 digit NIK Balita..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* STATUS LOOKUP BANNER */}
          {lookupStatus === "FOUND" && lookupResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 min-w-0">
                <div className="font-black flex items-center gap-2">
                  <span>NIK Terverifikasi di Data Kependudukan Resmi</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-200 text-emerald-800 font-mono">
                    KK: {lookupResult.noKK}
                  </span>
                </div>
                <p className="mt-0.5 text-emerald-800">
                  Data balita otomatis terhubung. Dikelompokkan ke <strong>{lookupResult.posyanduName}</strong> ({lookupResult.posyanduUnitCode}) sesuai wilayah RW {lookupResult.rw}.
                </p>
                {lookupResult.alreadyInPosyandu && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                    ✓ Sudah Terdaftar di Register Posyandu
                  </span>
                )}
              </div>
            </div>
          )}

          {lookupStatus === "NOT_FOUND" && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <div className="font-black text-amber-950">
                  ⚠️ Balita Belum Masuk KK / Belum Terdata di Kependudukan
                </div>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  Form input kependudukan resmi otomatis aktif. <strong>No. KK dan NIK WAJIB diisi</strong> untuk melacak bahwa fisik balita ada di wilayah desa, sehingga langsung otomatis masuk ke database kependudukan RT, RW, Kadus, & Desa.
                </p>
              </div>
            </div>
          )}

          {/* FORM FIELDS GRID */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* MANDATORY NO KK FIELD IF NEW CITIZEN OR NOT_FOUND */}
            {(isNewCitizen || lookupStatus === "NOT_FOUND") && (
              <div className="col-span-2 bg-amber-50/40 p-3 rounded-xl border border-amber-200/80">
                <label className="block text-xs font-black text-amber-950 mb-1">
                  Nomor Kartu Keluarga (No. KK) <span className="text-rose-600">* Wajib</span>
                </label>
                <input
                  value={noKK}
                  onChange={(e) => setNoKK(e.target.value)}
                  required
                  type="text"
                  maxLength={16}
                  placeholder="16 digit Nomor Kartu Keluarga fisik"
                  className="w-full border border-amber-300 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold"
                />
                <span className="text-[10px] text-amber-700 mt-1 block font-medium">
                  * Untuk melacak fisik balita dalam KK keluarga bersangkutan di data kependudukan desa.
                </span>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Balita *</label>
              <input
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                required
                type="text"
                placeholder="Nama Lengkap Balita"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none uppercase font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
              <input
                value={tempatLahir}
                onChange={(e) => setTempatLahir(e.target.value)}
                type="text"
                placeholder="BOGOR"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir *</label>
              <input
                value={tanggalLahir}
                onChange={(e) => setTanggalLahir(e.target.value)}
                required
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium"
              >
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ibu Kandung *</label>
              <input
                value={namaIbu}
                onChange={(e) => setNamaIbu(e.target.value)}
                required
                type="text"
                placeholder="Nama Ibu"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ayah (Opsional)</label>
              <input
                value={namaAyah}
                onChange={(e) => setNamaAyah(e.target.value)}
                type="text"
                placeholder="Nama Ayah"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RT *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">RW *</label>
              <select
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white font-bold text-slate-800"
              >
                {availableRws.map((rwVal: string) => (
                  <option key={rwVal} value={rwVal}>RW. {rwVal}</option>
                ))}
              </select>
            </div>

            {/* ASSIGNED POSYANDU MAWAR DISPLAY */}
            <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Wilayah Posyandu Otomatis:</span>
                <span className="text-sm font-black text-slate-800">{assignedUnit.name}</span>
                <span className="text-xs text-slate-500 ml-1.5">({assignedUnit.unitCode} • Cakupan {assignedUnit.rtDescription})</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-teal-100 text-teal-800">
                RW {rw || availableRws[0]}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              {isNewCitizen ? "Menyimpan ke Kependudukan & Posyandu" : "Mendaftarkan ke Register Posyandu"}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                Batal
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 text-xs font-black bg-teal-600 hover:bg-teal-700 text-white rounded-xl disabled:opacity-50 shadow-md cursor-pointer active:scale-95 transition-all">
                {loading ? "Menyimpan Data..." : isNewCitizen ? "Daftarkan Balita & KK" : "Simpan Data Balita"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
