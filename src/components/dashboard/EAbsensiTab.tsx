"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  QrCode, 
  Search, 
  Printer, 
  Trash2, 
  Download, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Filter,
  Check,
  AlertCircle,
  RefreshCw,
  ScanLine
} from "lucide-react";

// Web Audio API Success Tone
function playScanBeepSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6 Note
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.warn("Sound play disabled", e);
  }
}

// Initial Sample Scan Data
const DEFAULT_ABSENSI_LOGS = [
  {
    id: "LOG-101",
    barcodeId: "APR-PRK-001",
    nama: "HERNAWAN M. SODIK",
    kategori: "Perangkat Desa",
    jabatan: "Kepala Desa Cimanggu I",
    waktuScan: "2026-07-29 07:45:12",
    tipe: "MASUK",
    status: "Tepat Waktu",
    metode: "USB Hardware Scanner"
  },
  {
    id: "LOG-102",
    barcodeId: "APR-BPD-001",
    nama: "ABDUL AZIZ",
    kategori: "Badan Permusyawaratan Desa (BPD)",
    jabatan: "Ketua BPD",
    waktuScan: "2026-07-29 07:50:33",
    tipe: "MASUK",
    status: "Tepat Waktu",
    metode: "USB Hardware Scanner"
  },
  {
    id: "LOG-103",
    barcodeId: "APR-RTRW-001",
    nama: "ADE SAEPUDIN",
    kategori: "RT dan RW",
    jabatan: "Ketua RT 004 / RW 008",
    waktuScan: "2026-07-29 08:02:15",
    tipe: "MASUK",
    status: "Terlambat",
    metode: "USB Hardware Scanner"
  }
];

// Initial Aparatur Master for Barcode Matching
const DEFAULT_APARATUR_DATABASE = [
  { barcodeId: "APR-PRK-001", nik: "32011210010001", nama: "HERNAWAN M. SODIK", kategori: "Perangkat Desa", jabatan: "Kepala Desa Cimanggu I" },
  { barcodeId: "APR-PRK-002", nik: "32011210010002", nama: "M. TONNY GUNAWAN", kategori: "Perangkat Desa", jabatan: "Sekretaris Desa" },
  { barcodeId: "APR-PRK-003", nik: "32011210010003", nama: "IYOM MARYONO", kategori: "Perangkat Desa", jabatan: "Kasi Kesejahteraan" },
  { barcodeId: "APR-BPD-001", nik: "32011220010001", nama: "ABDUL AZIZ", kategori: "Badan Permusyawaratan Desa (BPD)", jabatan: "Ketua BPD" },
  { barcodeId: "APR-RTRW-001", nik: "32011230010001", nama: "ADE SAEPUDIN", kategori: "RT dan RW", jabatan: "Ketua RT 004 / RW 008" },
  { barcodeId: "APR-LPM-001", nik: "32011240010001", nama: "H. SUKARNA", kategori: "LPM", jabatan: "Ketua LPM Desa" },
  { barcodeId: "APR-POS-001", nik: "32011250010001", nama: "SITI NURJANAH", kategori: "POSYANDU", jabatan: "Kader Posyandu Mawar V" },
  { barcodeId: "APR-PKK-001", nik: "32011260010001", nama: "HJ. YULIANTI", kategori: "TP-PKK", jabatan: "Ketua TP-PKK" },
  { barcodeId: "APR-KTR-001", nik: "32011270010001", nama: "FAJAR SEPRIDO", kategori: "KARANG TARUNA", jabatan: "Ketua Karang Taruna" },
  { barcodeId: "APR-PKS-001", nik: "32011280010001", nama: "DEDI JUNAEDI", kategori: "PUSKESOS", jabatan: "Petugas SLRT Puskesos" }
];

export function EAbsensiTab({ session }: { session?: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("SEMUA");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [scanInput, setScanInput] = useState("");
  const [lastScannedAparatur, setLastScannedAparatur] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualInputActive, setManualInputActive] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load E-Absensi logs from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogs = localStorage.getItem("e_absensi_logs");
      if (savedLogs) {
        try {
          setLogs(JSON.parse(savedLogs));
        } catch (e) {
          setLogs(DEFAULT_ABSENSI_LOGS);
        }
      } else {
        setLogs(DEFAULT_ABSENSI_LOGS);
      }
    }
  }, []);

  // Keep scanner input focused for USB Hardware Scanner
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Save logs to localStorage on change
  const saveLogs = (newLogs: any[]) => {
    setLogs(newLogs);
    if (typeof window !== "undefined") {
      localStorage.setItem("e_absensi_logs", JSON.stringify(newLogs));
    }
  };

  // Helper get Aparatur DB merged from localStorage
  const getAparaturDB = () => {
    if (typeof window !== "undefined") {
      const customAparatur = localStorage.getItem("aparatur_custom_list");
      if (customAparatur) {
        try {
          const parsed = JSON.parse(customAparatur);
          return [...DEFAULT_APARATUR_DATABASE, ...parsed];
        } catch (e) {}
      }
    }
    return DEFAULT_APARATUR_DATABASE;
  };

  // Process Scanned Code from Hardware Scanner or Manual Input
  const processScanCode = (codeRaw: string) => {
    const code = codeRaw.trim().toUpperCase();
    if (!code) return;

    const cleanScan = code.replace(/[^A-Z0-9]/g, "");
    const db = getAparaturDB();

    const matched = db.find(
      (a: any) => {
        const bCode = (a.barcodeId || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const nikCode = (a.nik || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const idCode = (a.id || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const nameCode = (a.name || a.nama || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

        return (
          (bCode && bCode === cleanScan) || 
          (nikCode && nikCode === cleanScan) || 
          (idCode && idCode === cleanScan) ||
          (cleanScan.length >= 4 && (bCode.includes(cleanScan) || nameCode.includes(cleanScan)))
        );
      }
    );

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const fullTimeStr = `${formattedDate} ${formattedTime}`;

    // Determine Check-in vs Check-out for today
    const todayLogsForPerson = logs.filter(
      l => (l.barcodeId === code || (matched && l.nama === matched.nama)) && l.waktuScan.startsWith(formattedDate)
    );
    const tipe = todayLogsForPerson.length % 2 === 0 ? "MASUK" : "PULANG";

    // Determine Status (Hadir Tepat Waktu vs Terlambat - Threshold 08:00)
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
    const status = tipe === "MASUK" ? (isLate ? "Terlambat" : "Tepat Waktu") : "Selesai Tugas";

    const aparaturData = matched || {
      barcodeId: code,
      nama: `APARATUR (${code})`,
      kategori: "Perangkat Desa",
      jabatan: "Aparatur Desa"
    };

    const newLogEntry = {
      id: `LOG-${Date.now()}`,
      barcodeId: aparaturData.barcodeId || code,
      nama: aparaturData.nama,
      kategori: aparaturData.kategori || "Perangkat Desa",
      jabatan: aparaturData.jabatan || "Aparatur",
      waktuScan: fullTimeStr,
      tipe,
      status,
      metode: "USB Hardware Scanner (Iware)"
    };

    if (soundEnabled) {
      playScanBeepSound();
    }

    setLastScannedAparatur(newLogEntry);
    saveLogs([newLogEntry, ...logs]);
    setScanInput("");
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScanCode(scanInput);
  };

  const handleClearLogs = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh riwayat scan absensi?")) {
      saveLogs([]);
      setLastScannedAparatur(null);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("Tidak ada data absensi untuk diexport!");
      return;
    }

    const headers = ["No", "Waktu Scan", "Barcode ID", "Nama Aparatur", "Kategori Lembaga", "Jabatan", "Tipe", "Status"];
    const rows = logs.map((l, i) => [
      i + 1,
      `"${l.waktuScan}"`,
      `"${l.barcodeId}"`,
      `"${l.nama}"`,
      `"${l.kategori}"`,
      `"${l.jabatan}"`,
      `"${l.tipe}"`,
      `"${l.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hasil_Scan_E_Absensi_Desa_Cimanggu_I_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Logs for Table Display
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchSearch = 
        l.nama.toLowerCase().includes(search.toLowerCase()) ||
        l.barcodeId.toLowerCase().includes(search.toLowerCase()) ||
        l.jabatan.toLowerCase().includes(search.toLowerCase());
      const matchKategori = filterKategori === "SEMUA" || l.kategori === filterKategori;
      const matchTanggal = !filterTanggal || l.waktuScan.startsWith(filterTanggal);
      return matchSearch && matchKategori && matchTanggal;
    });
  }, [logs, search, filterKategori, filterTanggal]);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER WITH SCANNER INDICATOR */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <ScanLine size={13} className="text-emerald-400 animate-bounce" /> SYSTEM E-ABSENSI DESA
              </span>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} className="text-amber-300" /> Auto USB Desktop Scanner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">E-Absensi Hardware Scanner</h1>
            <p className="text-emerald-100/80 max-w-xl text-xs font-medium leading-relaxed">
              Tabel hasil scan absensi waktu-nyata terkoneksi dengan mesin scan barcode desktop (Iware/Honeywell/USB Scanner).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold ${
                soundEnabled 
                  ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200" 
                  : "bg-white/10 border-white/20 text-slate-300"
              }`}
              title={soundEnabled ? "Suara Beep Aktif" : "Suara Beep Bisu"}
            >
              {soundEnabled ? <Volume2 size={16} className="text-emerald-300" /> : <VolumeX size={16} />}
              <span>{soundEnabled ? "Suara Scanner ON" : "Suara OFF"}</span>
            </button>

            <div className="bg-white/15 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-100">Mesin Scan Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* USB HARDWARE SCANNER INPUT BOX (AUTO-FOCUSED & LISTENER) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <form onSubmit={handleScanSubmit} className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <QrCode size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Dekatkan Barcode ke Mesin Scan USB / Input Barcode NIK..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-emerald-200 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <ScanLine size={18} />
            <span>Simulasi Scan</span>
          </button>
        </form>

        {/* RECENT SCAN POPUP CARD */}
        {lastScannedAparatur && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  Scan Berhasil ({lastScannedAparatur.tipe}) • {lastScannedAparatur.status}
                </span>
                <h4 className="text-base font-black text-slate-900">{lastScannedAparatur.nama}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  {lastScannedAparatur.kategori} &bull; <span className="font-bold text-slate-700">{lastScannedAparatur.jabatan}</span> &bull; ID: {lastScannedAparatur.barcodeId}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                {lastScannedAparatur.waktuScan.split(" ")[1]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama / Barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Kategori Lembaga Dropdown Filter */}
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white text-slate-700"
          >
            <option value="SEMUA">Semua Kategori Lembaga</option>
            <option value="Perangkat Desa">1. Perangkat Desa</option>
            <option value="Badan Permusyawaratan Desa (BPD)">2. BPD</option>
            <option value="RT dan RW">3. RT dan RW</option>
            <option value="LPM">4. LPM</option>
            <option value="POSYANDU">5. POSYANDU</option>
            <option value="TP-PKK">6. TP-PKK</option>
            <option value="KARANG TARUNA">7. KARANG TARUNA</option>
            <option value="PUSKESOS">8. PUSKESOS</option>
          </select>

          {/* Tanggal Filter */}
          <input
            type="date"
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 bg-white text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Reset Logs</span>
          </button>
        </div>
      </div>

      {/* TABEL HASIL SCAN ABSENSI */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Tabel Hasil Scan Absensi</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Catatan kehadiran otomatis dari mesin scanner desktop</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
            Total {filteredLogs.length} Data Scan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">No</th>
                <th className="px-6 py-4">Waktu Scan</th>
                <th className="px-6 py-4">Barcode ID / NIK</th>
                <th className="px-6 py-4">Nama Aparatur</th>
                <th className="px-6 py-4">Kategori Lembaga</th>
                <th className="px-6 py-4">Jabatan</th>
                <th className="px-6 py-4 text-center">Tipe</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data scan absensi yang terekam.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-center font-bold">{idx + 1}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {log.waktuScan}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-200">
                        {log.barcodeId}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">{log.nama}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {log.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{log.jabatan}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        log.tipe === "MASUK" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {log.tipe}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        log.status === "Tepat Waktu" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                          : log.status === "Terlambat"
                          ? "bg-amber-50 text-amber-600 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
