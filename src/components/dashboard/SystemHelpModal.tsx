"use client";

import React from "react";
import { 
  X, 
  HelpCircle, 
  FileText, 
  Users, 
  Fingerprint, 
  HeartHandshake, 
  Command, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface SystemHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemHelpModal({ isOpen, onClose }: SystemHelpModalProps) {
  if (!isOpen) return null;

  const quickGuides = [
    {
      title: "1. Verifikasi Warga Baru",
      desc: "Periksa pendaftaran warga yang masuk di menu Verifikasi Warga, lalu setujui agar warga dapat mengajukan surat digital.",
      href: "/dashboard/verifikasi-warga",
      icon: Fingerprint,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "2. Pelayanan & Pembuatan Surat",
      desc: "Buat atau setujui permohonan surat warga (SKU, SKKM, Domisili, dll). Cetak surat resmi ber-barcode dengan 1 klik.",
      href: "/dashboard/surat",
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "3. Manajemen Aparatur & Absensi",
      desc: "Kelola data perangkat desa, RT/RW, dan BPD. Cetak ID Card resmi 2 sisi dengan barcode scanner untuk absensi.",
      href: "/dashboard/aparatur",
      icon: Users,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "4. Data Bansos & Kesejahteraan",
      desc: "Atur status desil 1-10 dan pendataan penerima bansos (PKH, BPNT, BLT) warga agar tepat sasaran.",
      href: "/dashboard/bansos",
      icon: HeartHandshake,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1d64ec] flex items-center justify-center shadow-xs">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Pusat Bantuan & Panduan Sistem
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Petunjuk ringkas penggunaan fitur Sistem Informasi Desa Cimanggu I
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Keyboard shortcut tip */}
          <div className="p-4 rounded-2xl bg-[#f4f7fc] border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Command size={18} className="text-[#1d64ec]" />
              <div>
                <p className="text-xs font-bold text-slate-800">Pencarian Cepat Global</p>
                <p className="text-[11px] text-slate-400 font-medium">Tekan tombol pintas untuk langsung mencari arsip atau warga</p>
              </div>
            </div>
            <kbd className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 shadow-2xs">
              Ctrl + K
            </kbd>
          </div>

          {/* Quick Guides List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Alur Panduan Cepat
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {quickGuides.map((guide, idx) => {
                const Icon = guide.icon;
                return (
                  <Link
                    key={idx}
                    href={guide.href}
                    onClick={onClose}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-[#f4f7fc] transition-all flex items-start gap-3.5 group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${guide.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-slate-900 group-hover:text-[#1d64ec] transition-colors">
                          {guide.title}
                        </p>
                        <ExternalLink size={13} className="text-slate-400 group-hover:text-[#1d64ec] transition-colors" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                        {guide.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Technical contact footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span className="font-semibold">Sistem Desa Terverifikasi & Aktif</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Versi 2.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
