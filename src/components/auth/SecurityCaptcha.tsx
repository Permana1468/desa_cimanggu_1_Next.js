"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

interface SecurityCaptchaProps {
  value: string;
  onChange: (val: string) => void;
  onRefresh?: () => void;
  isDarkTheme?: boolean;
}

// Alphanumeric characters excluding ambiguous ones (0, O, 1, I, l)
const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateCaptchaCode(length = 5): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

export function SecurityCaptcha({
  value,
  onChange,
  onRefresh,
  isDarkTheme = false,
}: SecurityCaptchaProps) {
  const [captchaCode, setCaptchaCode] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const elementId = useId();

  const refresh = useCallback(() => {
    setIsSpinning(true);
    const newCode = generateCaptchaCode();
    setCaptchaCode(newCode);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_captcha_code", newCode);
    }
    if (onRefresh) onRefresh();
    setTimeout(() => setIsSpinning(false), 500);
  }, [onRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label 
          htmlFor={`captcha-input-${elementId}`}
          className={`text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer ${
            isDarkTheme ? "text-white drop-shadow-sm" : "text-slate-800"
          }`}
        >
          <ShieldCheck size={15} className={isDarkTheme ? "text-cyan-400" : "text-blue-600"} />
          <span>Verifikasi Keamanan (Captcha)</span>
        </label>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isDarkTheme 
            ? "text-cyan-300 bg-cyan-950/60 border border-cyan-400/40" 
            : "text-slate-500 bg-slate-100 border border-slate-200"
        }`}>
          Bukan Robot
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Visual Distorted SVG Captcha Display - Cerah & Jelas Terbaca */}
        <div 
          className={`relative h-11 w-36 rounded-2xl overflow-hidden select-none flex items-center justify-center shrink-0 border shadow-md transition-all ${
            isDarkTheme 
              ? "bg-white border-white/90 shadow-[0_4px_14px_rgba(0,0,0,0.18)] ring-2 ring-white/40" 
              : "bg-white border-slate-200 shadow-sm"
          }`}
          style={{
            backgroundColor: "#ffffff",
            backgroundImage: `radial-gradient(#3b82f628 1.2px, transparent 1.2px)`,
            backgroundSize: "9px 9px",
          }}
          title="Klik tombol muat ulang jika kode kurang jelas"
        >
          {/* Security noise lines (Aksen cerah tanpa membuat gelap) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="0" y1="16" x2="140" y2="34" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="4,2" opacity="0.45" />
            <line x1="10" y1="34" x2="130" y2="10" stroke="#ec4899" strokeWidth="1.0" opacity="0.4" />
            <path d="M 8 22 Q 65 6 132 26" fill="none" stroke="#06b6d4" strokeWidth="1.2" opacity="0.45" />
          </svg>

          {/* Distorted alphanumeric characters (Warna cerah, tegas & kontras tinggi) */}
          <div className="flex items-center justify-center gap-1.5 px-2 relative z-10 font-mono font-black text-xl tracking-widest">
            {captchaCode.split("").map((char, index) => {
              // Deterministic rotation and displacement based on index
              const rotations = [-10, 8, -6, 12, -8];
              // Bright, high-contrast, vivid colors on white
              const colors = ["#2563eb", "#059669", "#7c3aed", "#d97706", "#0284c7"];
              const rot = rotations[index % rotations.length];
              const col = colors[index % colors.length];

              return (
                <span
                  key={index}
                  style={{
                    transform: `rotate(${rot}deg) translateY(${index % 2 === 0 ? "-1px" : "1.5px"})`,
                    color: col,
                    textShadow: "1px 1px 0px rgba(0,0,0,0.08)",
                  }}
                  className="inline-block transition-transform hover:scale-110 drop-shadow-xs"
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Refresh Button - Putih Cerah & Bersih */}
        <button
          type="button"
          onClick={refresh}
          title="Ganti Kode Captcha Baru"
          className={`w-11 h-11 rounded-2xl active:scale-95 flex items-center justify-center transition-all shrink-0 cursor-pointer border shadow-md ${
            isDarkTheme
              ? "bg-white hover:bg-sky-50 text-blue-600 border-white/80 ring-2 ring-white/30"
              : "bg-white hover:bg-slate-50 text-blue-600 border-slate-200"
          }`}
        >
          <RefreshCw size={17} className={isSpinning ? "animate-spin text-blue-600" : "text-blue-600"} />
        </button>

        {/* User Input Field - Putih Bersih Selaras dengan Input Lainnya */}
        <input
          id={`captcha-input-${elementId}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Isi kode"
          maxLength={6}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          required
          className={`flex-1 min-w-0 h-11 px-4 rounded-2xl text-xs font-mono font-black tracking-widest uppercase outline-none transition-all border shadow-md ${
            isDarkTheme 
              ? "bg-white border-white/90 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" 
              : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
          }`}
        />
      </div>
    </div>
  );
}
