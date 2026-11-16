"use client";

import React, { useState } from "react";
import { 
  X, 
  SlidersHorizontal, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Wifi, 
  CheckCircle2, 
  Check, 
  Sparkles
} from "lucide-react";

interface DisplayPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DisplayPreferencesModal({ isOpen, onClose }: DisplayPreferencesModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1d64ec] flex items-center justify-center shadow-xs">
              <SlidersHorizontal size={19} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Preferensi Tampilan & Sistem
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Kustomisasi kenyamanan kerja Anda di dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Preferensi Anda berhasil disimpan!</span>
            </div>
          )}

          {/* Setting 1: Suara Audio Scanner Presensi */}
          <div className="p-4 rounded-2xl bg-[#f4f7fc] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#1d64ec] flex items-center justify-center shadow-2xs">
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Suara Audio Scanner Absensi</p>
                <p className="text-[10px] text-slate-400 font-medium">Bip konfirmasi saat barcode discan</p>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? "bg-[#1d64ec]" : "bg-slate-300"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Setting 2: Kepadatan Tampilan Tabel */}
          <div className="p-4 rounded-2xl bg-[#f4f7fc] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#1d64ec] flex items-center justify-center shadow-2xs">
                <Monitor size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Mode Tabel Kompak</p>
                <p className="text-[10px] text-slate-400 font-medium">Rapatkan baris data agar muat lebih banyak</p>
              </div>
            </div>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                compactMode ? "bg-[#1d64ec]" : "bg-slate-300"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  compactMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Setting 3: Animasi Transisi Halus */}
          <div className="p-4 rounded-2xl bg-[#f4f7fc] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#1d64ec] flex items-center justify-center shadow-2xs">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Animasi Transisi Halaman</p>
                <p className="text-[10px] text-slate-400 font-medium">Efek halus saat berpindah antar tab</p>
              </div>
            </div>
            <button
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                animationsEnabled ? "bg-[#1d64ec]" : "bg-slate-300"
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  animationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Server Connection Indicator */}
          <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <Wifi size={15} className="text-emerald-600 animate-pulse" />
              <span>Status Koneksi Server:</span>
            </div>
            <span className="font-extrabold text-emerald-700">Online & Sinkron</span>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 px-5 rounded-full bg-[#1d64ec] hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={16} />
              <span>Terapkan Preferensi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
