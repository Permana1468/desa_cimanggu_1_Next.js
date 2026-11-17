"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Camera, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  ArrowLeft, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Wand2, 
  HelpCircle,
  RefreshCw,
  X,
  Eye,
  EyeOff
} from "lucide-react";

interface KaurStudioFotoTabProps {
  onBack: () => void;
  isHackerTheme?: boolean;
}

export function KaurStudioFotoTab({ onBack, isHackerTheme }: KaurStudioFotoTabProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [hasServerKey, setHasServerKey] = useState(false);
  const [testResult, setTestResult] = useState<{ status: "idle" | "testing" | "success" | "error"; message: string }>({
    status: "idle",
    message: ""
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check saved API key & server status
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key") || "";
    setApiKeyInput(savedKey);

    fetch("/api/ai/studio-foto")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasServerKey) {
          setHasServerKey(true);
        }
      })
      .catch((err) => console.warn("Check AI status error:", err));
  }, []);

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      localStorage.setItem("gemini_api_key", trimmed);
    } else {
      localStorage.removeItem("gemini_api_key");
    }
    setIsKeyModalOpen(false);

    // Reload iframe to apply key
    if (iframeRef.current) {
      iframeRef.current.src = "/studio-foto/index.html?t=" + Date.now();
    }
  };

  const handleTestApiKey = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest && !hasServerKey) {
      setTestResult({
        status: "error",
        message: "Masukkan Kunci API terlebih dahulu untuk melakukan pengujian."
      });
      return;
    }

    setTestResult({ status: "testing", message: "Menghubungi Google Gemini AI..." });
    try {
      const res = await fetch("/api/ai/studio-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          payload: { contents: [{ parts: [{ text: "Ping test connection" }] }] },
          apiKey: keyToTest
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult({
          status: "success",
          message: "Koneksi berhasil! API Key valid dan siap digunakan untuk memproses foto."
        });
      } else {
        setTestResult({
          status: "error",
          message: data.error || "Gagal menghubungkan ke layanan Gemini AI."
        });
      }
    } catch (err: any) {
      setTestResult({
        status: "error",
        message: err.message || "Terjadi kesalahan jaringan saat menguji API Key."
      });
    }
  };

  return (
    <div className={`space-y-4 font-sans relative ${isFullscreen ? "fixed inset-0 z-50 bg-slate-900 p-2 sm:p-4 overflow-hidden" : ""}`}>
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER CONTROL BAR                                 */}
      {/* ========================================================= */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl border transition-all ${
        isHackerTheme 
          ? "bg-slate-900/90 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan-50" 
          : "bg-white border-slate-200/90 shadow-sm text-slate-800"
      }`}>
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              isHackerTheme 
                ? "bg-cyan-950/60 hover:bg-cyan-900/80 border-cyan-500/40 text-cyan-300" 
                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
            }`}
            title="Kembali ke Dashboard Kaur Perencanaan"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/25">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight">Instan Studio Foto AI</h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-sky-500 text-white shadow-xs">v3.0</span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini AI Real-time
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                M.A_Collection.js by Muhamad Aldiansyah • 13 Modul Kreatif Foto & Desain Perangkat Desa
              </p>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* API Key Config Button */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              apiKeyInput || hasServerKey
                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
            }`}
          >
            <KeyRound size={14} className={apiKeyInput || hasServerKey ? "text-emerald-600" : "text-amber-600"} />
            <span>{hasServerKey ? "Kunci Server Aktif" : (apiKeyInput ? "Kunci Personal Aktif" : "Atur Kunci API AI")}</span>
            <span className={`w-2 h-2 rounded-full ${apiKeyInput || hasServerKey ? "bg-emerald-500" : "bg-amber-500"}`} />
          </button>

          {/* Open in New Window */}
          <a
            href="/studio-foto/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1.5"
            title="Buka di tab browser terpisah"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Tab Baru</span>
          </a>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isFullscreen 
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={14} />
                <span>Kecilkan</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} />
                <span>Layar Penuh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. EMBEDDED STUDIO FOTO IFRAME                           */}
      {/* ========================================================= */}
      <div className={`relative rounded-3xl overflow-hidden border shadow-sm transition-all ${
        isFullscreen 
          ? "h-[calc(100vh-90px)] border-slate-700" 
          : "h-[calc(100vh-210px)] min-h-[750px] border-slate-200/90 bg-white"
      }`}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-700">Menyiapkan Instan Studio Foto AI...</p>
            <p className="text-xs text-slate-400">Memuat M.A_Collection.js v3.0 & Google Gemini Engine</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="/studio-foto/index.html"
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          title="Instan Studio Foto AI - M.A_Collection.js"
          allow="camera; microphone; clipboard-write; fullscreen"
        />
      </div>

      {/* ========================================================= */}
      {/* 3. API KEY CONFIGURATION MODAL                           */}
      {/* ========================================================= */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
                  <KeyRound size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Pengaturan Kunci API Gemini</h3>
                  <p className="text-xs text-slate-500">Integrasi AI Generator Foto & Desain Perangkat Desa</p>
                </div>
              </div>
              <button 
                onClick={() => setIsKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs text-sky-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-sky-900">
                  <ShieldCheck size={16} className="text-sky-600" />
                  Status Kunci Server Desa:
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {hasServerKey 
                    ? "✅ Server desa telah memiliki kunci API default. Anda dapat langsung menggunakan AI tanpa mengisi form di bawah, atau masukkan kunci personal Anda untuk kuota tersendiri."
                    : "ℹ️ Server desa belum memiliki kunci API global. Silakan tempelkan kunci API Gemini personal Anda dari Google AI Studio."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Google Gemini API Key:</label>
                <div className="relative">
                  <input
                    type={showKeyPassword ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none font-mono text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showKeyPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Tersimpan aman di peramban Anda.</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:text-sky-700 font-bold inline-flex items-center gap-1"
                  >
                    Ambil Kunci Gratis di AI Studio <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {testResult.message && (
                <div className={`text-xs p-3 rounded-xl border ${
                  testResult.status === "testing" 
                    ? "bg-slate-50 text-slate-700 border-slate-200" 
                    : testResult.status === "success" 
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  {testResult.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={testResult.status === "testing"}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} className="text-sky-600" />
                <span>{testResult.status === "testing" ? "Menguji..." : "Uji Koneksi"}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Simpan & Aktifkan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
