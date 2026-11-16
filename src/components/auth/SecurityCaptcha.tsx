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
          className={`text-[11px] font-bold flex items-center gap-1.5 cursor-pointer ${
            isDarkTheme ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <ShieldCheck size={14} className="text-[#1d64ec]" />
          <span>Verifikasi Keamanan (Captcha)</span>
        </label>
        <span className="text-[10px] text-slate-400 font-medium">Bukan Robot</span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Visual Distorted SVG Captcha Display */}
        <div 
          className="relative h-11 w-36 rounded-2xl overflow-hidden select-none flex items-center justify-center shrink-0 border border-slate-200/80 shadow-inner bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-50"
          style={{
            backgroundImage: `radial-gradient(#1d64ec22 1px, transparent 1px)`,
            backgroundSize: "8px 8px",
          }}
          title="Klik tombol muat ulang jika kode kurang jelas"
        >
          {/* Security noise lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <line x1="0" y1="15" x2="140" y2="35" stroke="#1d64ec" strokeWidth="1.5" strokeDasharray="4,2" />
            <line x1="10" y1="35" x2="130" y2="10" stroke="#f43f5e" strokeWidth="1.2" />
            <path d="M 10 20 Q 60 5 130 25" fill="none" stroke="#0ea5e9" strokeWidth="1.2" />
          </svg>

          {/* Distorted alphanumeric characters */}
          <div className="flex items-center justify-center gap-1.5 px-2 relative z-10 font-mono font-black text-lg tracking-widest">
            {captchaCode.split("").map((char, index) => {
              // Deterministic rotation and displacement based on index
              const rotations = [-12, 8, -6, 14, -10];
              const colors = ["#1e3a8a", "#0f766e", "#1d4ed8", "#4338ca", "#0369a1"];
              const rot = rotations[index % rotations.length];
              const col = colors[index % colors.length];

              return (
                <span
                  key={index}
                  style={{
                    transform: `rotate(${rot}deg) translateY(${index % 2 === 0 ? "-1px" : "2px"})`,
                    color: col,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.15)",
                  }}
                  className="inline-block transition-transform hover:scale-110"
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={refresh}
          title="Ganti Kode Captcha Baru"
          className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all shrink-0 cursor-pointer border border-slate-200/60"
        >
          <RefreshCw size={16} className={isSpinning ? "animate-spin text-[#1d64ec]" : ""} />
        </button>

        {/* User Input Field */}
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
          className={`flex-1 min-w-0 h-11 px-3.5 rounded-2xl text-xs font-mono font-bold tracking-wider uppercase outline-none transition-all border ${
            isDarkTheme 
              ? "bg-white/90 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20" 
              : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
          }`}
        />
      </div>
    </div>
  );
}

