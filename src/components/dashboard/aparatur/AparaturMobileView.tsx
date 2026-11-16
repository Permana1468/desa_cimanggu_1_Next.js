"use client";

import React from "react";
import { 
  Building, 
  UserPlus, 
  Search, 
  QrCode, 
  Printer, 
  Pencil, 
  FileText, 
  Trash2,
  X,
  FileBadge2,
  AlertCircle
} from "lucide-react";
import { KATEGORI_LEMBAGA_LIST } from "@/app/dashboard/aparatur/page";
import type { AparaturItem } from "./AparaturDesktopView";

interface AparaturMobileViewProps {
  aparatur: AparaturItem[];
  filteredAparatur: AparaturItem[];
  selectedKategori: string;
  setSelectedKategori: (val: string) => void;
  search: string;
  setSearch: (val: string) => void;
  isAdminMaster: boolean;
  onAddClick: () => void;
  onEditClick: (person: AparaturItem) => void;
  onSkClick: (person: AparaturItem) => void;
  onDeleteClick: (id: string) => void;
  onPrintCard: (person: AparaturItem) => void;
}

export function AparaturMobileView({
  aparatur,
  filteredAparatur,
  selectedKategori,
  setSelectedKategori,
  search,
  setSearch,
  isAdminMaster,
  onAddClick,
  onEditClick,
  onSkClick,
  onDeleteClick,
  onPrintCard,
}: AparaturMobileViewProps) {
  const totalCount = aparatur.length;

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* 1. MOBILE APP HEADER BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1d64ec] text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Building size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                  Aparatur Desa
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-[#1d64ec] border border-blue-200">
                  {filteredAparatur.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Manajemen data & ID Card absensi
              </p>
            </div>
          </div>

          {isAdminMaster && (
            <button
              onClick={onAddClick}
              className="p-2.5 rounded-full bg-[#1d64ec] text-white hover:bg-[#1554c9] active:scale-95 transition-all shadow-md shadow-blue-600/25 cursor-pointer flex items-center justify-center shrink-0"
              title="Tambah Aparatur"
            >
              <UserPlus size={18} />
            </button>
          )}
        </div>

        {/* Mobile Search Input */}
        <div className="relative w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari aparatur, jabatan, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Mobile Horizontal Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 custom-scrollbar scroll-smooth -mx-1 px-1">
          <button
            onClick={() => setSelectedKategori("SEMUA")}
            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedKategori === "SEMUA"
                ? "bg-[#1d64ec] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 active:bg-slate-200"
            }`}
          >
            Semua ({totalCount})
          </button>
          {KATEGORI_LEMBAGA_LIST.map((kat, idx) => {
            const count = aparatur.filter((a) =>
              (a.kategori || "Perangkat Desa").toLowerCase().includes(kat.toLowerCase())
            ).length;

            return (
              <button
                key={idx}
                onClick={() => setSelectedKategori(kat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                  selectedKategori === kat
                    ? "bg-[#1d64ec] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 active:bg-slate-200"
                }`}
              >
                <span>{kat}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    selectedKategori === kat
                      ? "bg-white/25 text-white font-black"
                      : "bg-slate-200 text-slate-500 font-semibold"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MOBILE CARD LIST (DEDICATED APP-LIKE INTERFACE) */}
      <div className="space-y-3">
        {filteredAparatur.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700">Tidak ada aparatur</p>
            <p className="text-xs text-slate-400">
              Tidak ditemukan data yang sesuai dengan pencarian atau filter yang dipilih.
            </p>
          </div>
        ) : (
          filteredAparatur.map((person) => {
            const barcodeCode = person.barcodeId || person.nik || `APR-DESA-${person.id.slice(0, 5)}`;
            const kat = person.kategori || "Perangkat Desa";
            const hasSK = Boolean(person.skNumber && person.skNumber.trim() !== "");

            return (
              <div
                key={person.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 transition-all active:scale-[0.99]"
              >
                {/* Top: Avatar, Name, Position & Category Badge */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-base overflow-hidden relative shrink-0 border border-slate-200/70 shadow-xs">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      person.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug truncate">
                        {person.name}
                      </h3>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {kat}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {person.position}
                    </p>
                  </div>
                </div>

                {/* Middle: Barcode Chip & SK Status */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  {/* Barcode Chip */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Barcode</p>
                      <p className="text-[11px] font-mono font-bold text-slate-800 truncate">
                        {barcodeCode}
                      </p>
                    </div>
                    <button
                      onClick={() => onPrintCard(person)}
                      className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 shrink-0"
                      title="Lihat Barcode"
                    >
                      <QrCode size={14} />
                    </button>
                  </div>

                  {/* SK Status Chip */}
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Status SK</p>
                    {hasSK ? (
                      <p className="text-[10px] font-mono font-bold text-emerald-700 truncate flex items-center gap-1">
                        <FileBadge2 size={11} className="shrink-0" />
                        <span>{person.skNumber}</span>
                      </p>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Belum Terbit
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom: Mobile Touch-Friendly Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  {/* Print ID Card Button (Primary) */}
                  <button
                    onClick={() => onPrintCard(person)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Printer size={14} />
                    <span>Cetak ID Card</span>
                  </button>

                  {isAdminMaster && (
                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => onEditClick(person)}
                        className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200/60 active:scale-95 transition-all cursor-pointer"
                        title="Edit Data"
                      >
                        <Pencil size={15} />
                      </button>

                      {/* SK Button */}
                      <button
                        onClick={() => onSkClick(person)}
                        className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 active:scale-95 transition-all cursor-pointer"
                        title="Manajemen SK"
                      >
                        <FileText size={15} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDeleteClick(person.id)}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 active:scale-95 transition-all cursor-pointer"
                        title="Hapus Aparatur"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
