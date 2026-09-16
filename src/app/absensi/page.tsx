"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  QrCode,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Sparkles,
  ShieldCheck,
  Zap
} from "lucide-react";

// Dynamic import of Three.js 3D Scanner Kiosk Component to prevent SSR issues
const ThreeScannerKiosk = dynamic(() => import("@/components/absensi/ThreeScannerKiosk"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-center text-sky-800 font-bold animate-pulse">
      <QrCode size={52} className="animate-spin text-sky-600 mb-3" />
      <span className="text-xs uppercase tracking-widest bg-white/80 px-4 py-1.5 rounded-full border border-sky-300 shadow-md">
        Memuat Monumen 3D...
      </span>
    </div>
  )
});

// Default Aparatur Database
const DEFAULT_APARATUR_DATABASE = [
  { barcodeId: "APR-PRK-001", nik: "32011210010001", nama: "MUHAMAD ALDIANSYAH", kategori: "Perangkat Desa", jabatan: "KAUR PERENCANAAN", photo: "/images/OKE ALDY.png" },
  { barcodeId: "APR-PRK-002", nik: "32011210010002", nama: "H. AHMAD SYARIF", kategori: "Perangkat Desa", jabatan: "Sekretaris Desa" },
  { barcodeId: "APR-BPD-001", nik: "32011220010001", nama: "DRS. M. RIDWAN", kategori: "Badan Permusyawaratan Desa (BPD)", jabatan: "Ketua BPD" },
  { barcodeId: "APR-RTR-001", nik: "32011230010001", nama: "H. SUKARNA", kategori: "RT dan RW", jabatan: "Ketua RW 008" },
  { barcodeId: "APR-LPM-001", nik: "32011240010001", nama: "DEDI JUNAEDI", kategori: "LPM", jabatan: "Ketua LPM" },
  { barcodeId: "APR-POS-001", nik: "32011250010001", nama: "SITI NURAENI", kategori: "POSYANDU", jabatan: "Kader Posyandu Mawar" },
  { barcodeId: "APR-PKK-001", nik: "32011260010001", nama: "HJ. YULIANTI", kategori: "TP-PKK", jabatan: "Ketua TP-PKK" },
  { barcodeId: "APR-KTR-001", nik: "32011270010001", nama: "FAJAR SEPRIDO", kategori: "KARANG TARUNA", jabatan: "Ketua Karang Taruna", photo: "/images/OKE FAJAR.png" },
  { barcodeId: "APR-PKS-001", nik: "32011280010001", nama: "DEDI JUNAEDI", kategori: "PUSKESOS", jabatan: "Petugas SLRT Puskesos" }
];

// Left Side Team Carousel Mascots
const LEFT_MASCOTS = [
  { id: "aldy", name: "M. Aldiansyah", role: "Kaur Perencanaan", image: "/images/OKE ALDY.png" },
  { id: "angga", name: "Angga", role: "Tim Aparatur Desa", image: "/images/OKE ANGGA.png" }
];

// Right Side Team Carousel Mascots
const RIGHT_MASCOTS = [
  { id: "fajar", name: "Fajar Seprido", role: "Ketua Karang Taruna", image: "/images/OKE FAJAR.png" },
  { id: "abdul", name: "Abdul", role: "Tim Aparatur Desa", image: "/images/OKE ABDUL.png" },
  { id: "epul", name: "Epul", role: "Tim Aparatur Desa", image: "/images/OKE EPUL.png" }
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

  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const lastProcessedRef = useRef<{ code: string; time: number }>({ code: "", time: 0 });

  // Auto-rotate Left & Right Carousels every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % LEFT_MASCOTS.length);
      setRightIndex((prev) => (prev + 1) % RIGHT_MASCOTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const [settings, setSettings] = useState({
    jamMasuk: "07:00",
    jamPulang: "16:00",
    toleransiMenit: 0
  });

  // Load E-Absensi logs & settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLogs = localStorage.getItem("e_absensi_logs");
      if (savedLogs) {
        try {
          setLogs(JSON.parse(savedLogs));
        } catch (e) { }
      }

      const savedSettings = localStorage.getItem("e_absensi_settings");
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (e) { }
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
        } catch (e) { }
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
  function processScanCode(codeRaw: string) {
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

    // Determine Status & Messages
    const [targetH, targetM] = (settings.jamMasuk || "07:00").split(":").map(Number);
    const targetMinutes = targetH * 60 + targetM + Number(settings.toleransiMenit || 0);

    const [pulangH, pulangM] = (settings.jamPulang || "16:00").split(":").map(Number);
    const targetPulangMinutes = pulangH * 60 + pulangM;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let status = "";
    let greeting = "";
    let messageText = "";

    const formatDuration = (diffMins: number): string => {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (hours > 0 && mins > 0) return `${hours} jam ${mins} menit`;
      if (hours > 0) return `${hours} jam`;
      return `${mins} menit`;
    };

    if (tipe === "MASUK") {
      if (currentMinutes > targetMinutes) {
        const diff = currentMinutes - targetMinutes;
        const durationText = formatDuration(diff);
        status = "Terlambat";
        greeting = "Selamat Datang!";
        messageText = `Terlambat ${durationText}. Tetap semangat & tingkatkan kedisiplinan! 💪`;
      } else {
        status = "Tepat Waktu";
        greeting = "Selamat Pagi & Selamat Datang!";
        messageText = "Hadir tepat waktu! Semangat mengabdi melayani warga hari ini! 🚀✨";
      }
    } else {
      greeting = "Selamat Pulang!";
      if (currentMinutes < targetPulangMinutes) {
        const diff = targetPulangMinutes - currentMinutes;
        const durationText = formatDuration(diff);
        status = "Pulang Awal";
        messageText = `Pulang lebih awal ${durationText}. Hati-hati di jalan dan selamat beristirahat! 😊`;
      } else {
        status = "Selesai Tugas";
        messageText = "Terima kasih atas kerja keras & dedikasi tinggi Anda hari ini! 👋🌟";
      }
    }

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
      greeting,
      messageText,
      metode: "Standalone Public Kiosk (USB Scanner)"
    };

    if (soundEnabled) {
      playScanBeepSound();
    }

    setLastScanned(newLogEntry);
    saveLogs([newLogEntry, ...logs]);
    setScanInput("");

    // Auto clear popup after 10 seconds
    setTimeout(() => {
      setLastScanned((prev: any) => (prev?.id === newLogEntry.id ? null : prev));
    }, 10000);
  }

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScanCode(scanInput);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
      }
      setIsFullscreen(false);
    }
  };

  const currentLeftMascot = LEFT_MASCOTS[leftIndex];
  const currentRightMascot = RIGHT_MASCOTS[rightIndex];

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-br from-sky-300 via-cyan-200 to-indigo-300 text-slate-900 font-sans flex flex-col justify-between relative select-none">

      {/* ANIMATED LIGHT BLUE BACKGROUND FLOATING ELEMENTS */}
      <div className="absolute top-5 left-5 w-[450px] h-[450px] bg-white/40 rounded-full blur-3xl pointer-events-none animate-[pulse_7s_infinite_ease-in-out]" />
      <div className="absolute bottom-5 right-5 w-[550px] h-[550px] bg-sky-400/30 rounded-full blur-3xl pointer-events-none animate-[pulse_9s_infinite_ease-in-out]" />
      <div className="absolute top-10 right-1/3 text-amber-300/80 animate-bounce pointer-events-none hidden sm:block">
        <Sparkles size={36} />
      </div>

      {/* ELEGANT HEADER (CLEAN ON MOBILE & DESKTOP) */}
      <header className="relative z-40 px-4 sm:px-10 py-3 shrink-0 flex items-center justify-between gap-4">
        {/* LOGO & TITLE */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <Image
            src="/images/logo-bogor.png"
            width={48}
            height={48}
            alt="Logo Kab Bogor"
            className="object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] sm:w-[54px] sm:h-[54px]"
          />
          <div>
            <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-slate-900 uppercase">
              PEMERINTAH DESA CIMANGGU I
            </h1>
            <p className="text-[11px] sm:text-xs font-extrabold text-sky-900 tracking-wide">
              Kecamatan Cibungbulang &bull; Kabupaten Bogor
            </p>
          </div>
        </div>

        {/* CLOCK & CONTROLS */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="text-right">
            <div className="text-base sm:text-2xl font-black font-mono text-sky-950 tracking-wider">
              {timeStr || "00:00:00"} <span className="text-xs font-bold text-sky-800">WIB</span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-extrabold text-sky-900 capitalize">{dateStr}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 sm:p-2.5 rounded-2xl border transition-all flex items-center justify-center cursor-pointer shadow-md ${soundEnabled
                ? "bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/30"
                : "bg-slate-800 border-slate-700 text-slate-400 shadow-slate-800/30"
                }`}
              title={soundEnabled ? "Suara Beep Aktif" : "Suara Beep Bisu"}
            >
              {soundEnabled ? <Volume2 size={18} className="animate-bounce" /> : <VolumeX size={18} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-2xl border border-sky-600/30 bg-sky-800/90 text-white hover:bg-sky-900 transition-all cursor-pointer shadow-md backdrop-blur-md hidden sm:flex"
              title="Full Screen Mode"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <Link
              href="/"
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 border border-amber-300 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/30 hover:brightness-105 active:scale-95"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN KIOSK STAGE: MASCOTS MOVED CLOSER TO CENTER 3D TUGU MONUMENT */}
      <main className="relative z-30 flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 py-1 flex items-center justify-center gap-0 sm:gap-2 overflow-hidden">

        {/* ---------------------------------------------------- */}
        {/* LEFT SIDE MASCOT CAROUSEL (POSITIONED CLOSER TO TUGU) */}
        {/* ---------------------------------------------------- */}
        <div className="hidden sm:flex w-1/4 h-full flex-col items-center justify-center relative transform translate-x-6 md:translate-x-10 z-30">
          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <Image
              src={currentLeftMascot.image}
              alt={currentLeftMascot.name}
              fill
              sizes="320px"
              className="object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)] transform hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CENTER STAGE: THREE.JS 3D TUGU MONUMENT & RESULT CARD */}
        {/* ---------------------------------------------------- */}
        <div className="w-full sm:w-2/4 h-full flex flex-col items-center justify-between relative py-1 z-20">

          {/* 3D TUGU MONUMENT WEBGL CANVAS */}
          <div className="w-full flex-1 flex items-center justify-center relative">
            <ThreeScannerKiosk
              scanInput={scanInput}
              setScanInput={setScanInput}
              onScanSubmit={handleScanSubmit}
              inputRef={inputRef}
            />
          </div>

          {/* SCAN RESULT / IDLE PROMPT TEXT BANNER */}
          <div className="w-full max-w-lg shrink-0 mt-1 px-2">
            {lastScanned ? (
              <div className={`bg-slate-900/90 border-2 ${lastScanned.status === "Terlambat" || lastScanned.status === "Pulang Awal"
                ? "border-amber-400 shadow-[0_10px_30px_rgba(245,158,11,0.3)]"
                : "border-emerald-400 shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                } backdrop-blur-xl rounded-2xl p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-300 space-y-2 text-white`}>

                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <CheckCircle2 size={13} /> ABSENSI BERHASIL ({lastScanned.tipe})
                  </span>
                  <span className="font-mono text-[11px] sm:text-xs font-black text-cyan-300 bg-slate-950 px-3 py-1 rounded-xl border border-cyan-500/40">
                    {lastScanned.waktuScan.split(" ")[1]} WIB
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 rounded-xl bg-slate-800 border-2 border-cyan-400/50 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                    {lastScanned.photo ? (
                      <img src={lastScanned.photo} alt={lastScanned.nama} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">{lastScanned.nama.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">{lastScanned.nama}</h2>
                    <p className="text-[11px] font-bold text-cyan-400 uppercase">{lastScanned.jabatan}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{lastScanned.kategori}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-1">
                <p className="text-xs sm:text-sm font-black text-sky-950 tracking-wide uppercase drop-shadow-sm">
                  Silakan Scan ID Card Aparatur pada Mesin 3D Kiosk
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-extrabold text-sky-900 mt-0.5">
                  <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-600" /> Presensi Realtime</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-sky-700" /> Terintegrasi Sistem Desa</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ---------------------------------------------------- */}
        {/* RIGHT SIDE MASCOT CAROUSEL (POSITIONED CLOSER TO TUGU) */}
        {/* ---------------------------------------------------- */}
        <div className="hidden sm:flex w-1/4 h-full flex-col items-center justify-center relative transform -translate-x-6 md:-translate-x-10 z-30">
          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
            <Image
              src={currentRightMascot.image}
              alt={currentRightMascot.name}
              fill
              sizes="320px"
              className="object-contain filter drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)] transform hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </div>

      </main>

      {/* FOOTER - COMPACT ZERO SCROLL */}
      <footer className="relative z-40 px-4 sm:px-8 py-1.5 border-t border-sky-300/40 bg-white/60 backdrop-blur-md text-center text-[10px] sm:text-[11px] font-extrabold text-sky-950 flex items-center justify-between shrink-0">
        <span>System E-Absensi &bull; Desa Cimanggu I &copy; {new Date().getFullYear()}</span>
        <span className="font-black text-sky-900 uppercase tracking-wider hidden sm:inline">
          Inovasi 3D Kiosk Digital Desa
        </span>
      </footer>

    </div>
  );
}
