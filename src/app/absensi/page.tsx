"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  QrCode, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  VolumeX, 
  ScanLine, 
  Usb, 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  User,
  Building2,
  Calendar,
  Radio,
  ShieldCheck
} from "lucide-react";

// Default Aparatur Database (Synced with Admin)
const DEFAULT_APARATUR_DATABASE = [
  { barcodeId: "APR-PRK-001", nik: "32011210010001", nama: "MUHAMAD ALDIANSYAH", kategori: "Perangkat Desa", jabatan: "KAUR PERENCANAAN" },
  { barcodeId: "APR-PRK-002", nik: "32011210010002", nama: "H. AHMAD SYARIF", kategori: "Perangkat Desa", jabatan: "Sekretaris Desa" },
  { barcodeId: "APR-BPD-001", nik: "32011220010001", nama: "DRS. M. RIDWAN", kategori: "Badan Permusyawaratan Desa (BPD)", jabatan: "Ketua BPD" },
  { barcodeId: "APR-RTR-001", nik: "32011230010001", nama: "H. SUKARNA", kategori: "RT dan RW", jabatan: "Ketua RW 008" },
  { barcodeId: "APR-LPM-001", nik: "32011240010001", nama: "DEDI JUNAEDI", kategori: "LPM", jabatan: "Ketua LPM" },
  { barcodeId: "APR-POS-001", nik: "32011250010001", nama: "SITI NURAENI", kategori: "POSYANDU", jabatan: "Kader Posyandu Mawar" },
  { barcodeId: "APR-PKK-001", nik: "32011260010001", nama: "HJ. YULIANTI", kategori: "TP-PKK", jabatan: "Ketua TP-PKK" },
  { barcodeId: "APR-KTR-001", nik: "32011270010001", nama: "FAJAR SEPRIDO", kategori: "KARANG TARUNA", jabatan: "Ketua Karang Taruna" },
  { barcodeId: "APR-PKS-001", nik: "32011280010001", nama: "DEDI JUNAEDI", kategori: "PUSKESOS", jabatan: "Petugas SLRT Puskesos" }
];

// Double-Tone High-Pitch Scanner Chime (BEEP-BEEP)
function playScanBeepSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Tone 1: High C6 (1046.5Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046.50, now);
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Tone 2: High E6 (1318.5Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.12);
    gain2.gain.setValueAtTime(0.5, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.28);
  } catch (e) {
    console.warn("Sound play disabled", e);
  }
}

export default function PublicAbsensiKioskPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [scanInput, setScanInput] = useState("");
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scannerDeviceName, setScannerDeviceName] = useState("Iware USB 2D/1D Scanner");
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const lastProcessedRef = useRef<{ code: string; time: number }>({ code: "", time: 0 });

  // Digital Clock Timer
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setDateStr(now.toLocaleDateString('id-ID', optionsDate));
      setTimeStr(now.toLocaleTimeString('id-ID', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load E-Absensi logs from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogs = localStorage.getItem("e_absensi_logs");
      if (savedLogs) {
        try {
          setLogs(JSON.parse(savedLogs));
        } catch (e) {}
      }
    }
  }, []);

  // Web HID & USB HID Scanner Connection Listener
  useEffect(() => {
    if (typeof window !== "undefined" && "hid" in navigator) {
      const handleHidConnect = (e: any) => {
        if (e.device && e.device.productName) {
          setScannerDeviceName(e.device.productName);
        }
      };
      (navigator as any).hid.addEventListener("connect", handleHidConnect);
      return () => {
        (navigator as any).hid.removeEventListener("connect", handleHidConnect);
      };
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

  // Global Keyboard Keystroke Listener
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === "INPUT" && activeEl !== inputRef.current && (activeEl as HTMLInputElement).type === "text") {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        if (scanBufferRef.current.trim().length > 0) {
          const codeToProcess = scanBufferRef.current.trim();
          scanBufferRef.current = "";
          processScanCode(codeToProcess);
          setScanInput("");
        }
      } else if (e.key.length === 1) {
        if (timeDiff > 250) {
          scanBufferRef.current = "";
        }
        scanBufferRef.current += e.key;
      }
    };

    const handleGlobalClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [logs]);

  // Process Scanned Code
  const processScanCode = (codeRaw: string) => {
    let code = codeRaw.trim().toUpperCase();
    if (!code) return;

    // De-duplicate repeated string patterns
    const matchRepeat = code.match(/^([A-Z0-9\s-]+?)\1+$/);
    if (matchRepeat && matchRepeat[1]) {
      code = matchRepeat[1].trim();
    }

    const cleanScan = code.replace(/[^A-Z0-9]/g, "");
    if (!cleanScan) return;

    const db = getAparaturDB();

    // Find Aparatur from Database
    const matched = db.find(
      (a: any) => {
        const bCode = (a.barcodeId || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const nikCode = (a.nik || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        const idCode = (a.id || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

        return (
          (bCode && (cleanScan === bCode || cleanScan.includes(bCode) || bCode.includes(cleanScan))) || 
          (nikCode && (cleanScan === nikCode || cleanScan.includes(nikCode))) || 
          (idCode && (cleanScan === idCode || cleanScan.includes(idCode)))
        );
      }
    );

    const aparaturBarcodeId = matched ? (matched.barcodeId || matched.nik || code) : code;

    // Prevent duplicate bursts within 1500ms
    const nowMs = Date.now();
    if (lastProcessedRef.current.code === aparaturBarcodeId && nowMs - lastProcessedRef.current.time < 1500) {
      return;
    }
    lastProcessedRef.current = { code: aparaturBarcodeId, time: nowMs };

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const fullTimeStr = `${formattedDate} ${formattedTime}`;

    // Determine Check-in vs Check-out for today
    const todayLogsForPerson = logs.filter(
      l => (l.barcodeId === aparaturBarcodeId || (matched && (l.nama === matched.name || l.nama === matched.nama))) && l.waktuScan.startsWith(formattedDate)
    );
    const tipe = todayLogsForPerson.length % 2 === 0 ? "MASUK" : "PULANG";

    // Determine Status (Threshold 08:00)
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 0);
    const status = tipe === "MASUK" ? (isLate ? "Terlambat" : "Tepat Waktu") : "Selesai Tugas";

    const aparaturName = matched ? (matched.name || matched.nama || `APARATUR (${code})`) : `APARATUR (${code})`;
    const aparaturPosition = matched ? (matched.position || matched.jabatan || "Aparatur Desa") : "Aparatur Desa";
    const aparaturKategori = matched ? (matched.kategori || "Perangkat Desa") : "Perangkat Desa";
    const aparaturPhoto = matched ? matched.photo : null;

    const newLogEntry = {
      id: `LOG-${Date.now()}`,
      barcodeId: aparaturBarcodeId,
      nama: aparaturName,
      kategori: aparaturKategori,
      jabatan: aparaturPosition,
      photo: aparaturPhoto,
      waktuScan: fullTimeStr,
      tipe,
      status,
      metode: "Standalone Public Kiosk (USB Scanner)"
    };

    if (soundEnabled) {
      playScanBeepSound();
    }

    setLastScanned(newLogEntry);
    saveLogs([newLogEntry, ...logs]);
    setScanInput("");

    // Auto clear popup after 8 seconds
    setTimeout(() => {
      setLastScanned((prev: any) => (prev?.id === newLogEntry.id ? null : prev));
    }, 8000);
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScanCode(scanInput);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* BACKGROUND NEON GLOW GRID EFFECTS */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* TOP HEADER NAVIGATION */}
      <header className="relative z-20 px-4 sm:px-8 py-4 sm:py-6 border-b border-emerald-500/20 bg-slate-950/90 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <Image src="/images/logo-bogor.png" width={36} height={36} alt="Logo Kab Bogor" className="object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-black tracking-wider text-white uppercase">PEMERINTAH DESA CIMANGGU I</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center gap-1 shrink-0">
                  <Sparkles size={10} className="text-emerald-400 animate-bounce" /> Kiosk Absensi
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wide">Kecamatan Cibungbulang &bull; Kabupaten Bogor</p>
            </div>
          </div>
        </div>

        {/* CLOCK & ACTION CONTROLS */}
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
          <div className="text-left sm:text-right">
            <div className="text-lg sm:text-2xl font-black font-mono text-emerald-400 tracking-wider drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
              {timeStr || "00:00:00"} <span className="text-[10px] sm:text-xs font-sans text-emerald-200">WIB</span>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 capitalize">{dateStr}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-center cursor-pointer ${
                soundEnabled 
                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                  : "bg-slate-900 border-slate-800 text-slate-500"
              }`}
              title={soundEnabled ? "Suara Beep Aktif" : "Suara Beep Bisu"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 sm:p-3 rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              title="Full Screen Mode"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <Link
              href="/"
              className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN HERO KIOSK AREA */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 flex flex-col justify-center gap-6 sm:gap-8">
        
        {/* SCANNER HARDWARE STATUS CARD */}
        <div className="bg-slate-900/80 border-2 border-emerald-500/40 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <Usb size={26} className="animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-400" /> MESIN SCANNER ACTIVE (ONLINE)
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  STANDALONE KIOSK MODE
                </span>
              </div>
              <p className="text-slate-300 text-xs font-semibold mt-1">
                Perangkat: <span className="text-white font-black">{scannerDeviceName}</span> &bull; Status: <span className="text-emerald-300 font-bold">Siap Membaca QR Code Kotak / Barcode</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playScanBeepSound();
              alert("✓ Tes Respon Scanner Kiosk Berhasil!\n\nMesin scanner USB & respon audio chime aktif 100%.");
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Radio size={16} className="animate-pulse text-emerald-200" />
            <span>Tes Respon Sound</span>
          </button>
        </div>

        {/* SCAN HERO RADAR ANIMATION BOX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* RADAR / SCANNER FRAME */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-slate-900/90 border-4 border-emerald-500/50 p-6 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden group">
              
              {/* LASER SCANNING BEAM ANIMATION */}
              <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-[scan_2.5s_infinite_ease-in-out]" />

              <div className="w-24 h-24 rounded-2xl bg-emerald-500/10 border-2 border-dashed border-emerald-400/60 flex items-center justify-center text-emerald-400 mb-4 relative shadow-inner">
                <QrCode size={48} className="animate-pulse text-emerald-400" />
              </div>

              <h3 className="text-sm font-black text-white uppercase tracking-wider text-center">ARAHKAN BARCODE ID CARD</h3>
              <p className="text-[11px] font-semibold text-slate-400 text-center mt-1">Ke Lampu Red Laser Mesin Scan USB</p>

              {/* HIDDEN INPUT FIELD AUTO FOCUSED */}
              <form onSubmit={handleScanSubmit} className="w-full mt-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Ketik/Scan Barcode..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-center text-emerald-300 focus:outline-none focus:border-emerald-500 transition-all opacity-80"
                />
              </form>
            </div>
          </div>

          {/* POPUP SCAN RESULTS / INSTRUCTION CARD */}
          <div className="lg:col-span-7">
            {lastScanned ? (
              <div className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border-2 border-emerald-400/60 rounded-3xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-400" /> ABSENSI BERHASIL ({lastScanned.tipe})
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      lastScanned.status === "Tepat Waktu" ? "bg-emerald-500 text-slate-950" : "bg-amber-400 text-slate-950"
                    }`}>
                      {lastScanned.status}
                    </span>
                  </div>
                  <span className="font-mono text-sm font-black text-emerald-300 bg-slate-950 px-3 py-1 rounded-xl border border-emerald-500/30">
                    {lastScanned.waktuScan.split(" ")[1]}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-24 rounded-2xl bg-slate-800 border-2 border-emerald-400/40 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    {lastScanned.photo ? (
                      <img src={lastScanned.photo} alt={lastScanned.nama} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-slate-300">{lastScanned.nama.charAt(0)}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">{lastScanned.nama}</h2>
                    <p className="text-sm font-bold text-emerald-400 uppercase">{lastScanned.jabatan}</p>
                    <p className="text-xs font-semibold text-slate-400">{lastScanned.kategori}</p>
                    <div className="pt-2">
                      <span className="font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                        ID: {lastScanned.barcodeId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                  <ScanLine size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Silakan Scan ID Card Aparatur</h3>
                <p className="text-xs font-medium text-slate-400 max-w-md mx-auto leading-relaxed">
                  Dekatkan QR Code Kotak / Barcode pada sisi belakang ID Card Anda ke mesin scanner. Hasil absensi akan langsung tercatat di Sistem Desa secara otomatis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RECENT SCAN TICKER TABLE (TODAY'S SCANS) */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Riwayat Scan Absensi Hari Ini</h4>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              Total {logs.length} Presensi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">No</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Barcode ID</th>
                  <th className="px-4 py-3">Nama Aparatur</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-4 py-3 text-center">Tipe</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Belum ada data scan absensi hari ini.
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 8).map((l, i) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-center font-bold">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{l.waktuScan.split(" ")[1]}</td>
                      <td className="px-4 py-3 font-mono text-xs">{l.barcodeId}</td>
                      <td className="px-4 py-3 font-bold text-white uppercase">{l.nama}</td>
                      <td className="px-4 py-3 text-slate-400">{l.jabatan}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.tipe === "MASUK" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}>
                          {l.tipe}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === "Tepat Waktu" ? "bg-emerald-400/20 text-emerald-300" : "bg-amber-400/20 text-amber-300"
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 px-8 py-4 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 font-medium">
        System E-Absensi Integrated Kiosk &bull; Pemerintah Desa Cimanggu I &copy; {new Date().getFullYear()}
      </footer>

      {/* CSS KEYFRAME FOR LASER SCAN BEAM */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 98%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
