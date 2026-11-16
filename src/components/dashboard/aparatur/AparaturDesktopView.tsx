"use client";

import React from "react";
import { 
  Building, 
  UserPlus, 
  Filter, 
  Search, 
  Briefcase, 
  QrCode, 
  Printer, 
  Pencil, 
  FileText, 
  Trash2,
  X,
  AlertCircle,
  FileBadge2
} from "lucide-react";
import { KATEGORI_LEMBAGA_LIST } from "@/app/dashboard/aparatur/page";

export interface AparaturItem {
  id: string;
  name: string;
  position: string;
  kategori?: string;
  nik?: string;
  barcodeId?: string;
  email?: string;
  phoneNumber?: string;
  photo?: string;
  skNumber?: string;
  skUrl?: string;
  createdAt?: string;
}

interface AparaturDesktopViewProps {
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

export function AparaturDesktopView({
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
}: AparaturDesktopViewProps) {
  // Stat calculations
  const totalCount = aparatur.length;
  const skCount = aparatur.filter((a) => Boolean(a.skNumber && a.skNumber.trim() !== "")).length;
  const withBarcodeCount = aparatur.filter((a) => Boolean(a.barcodeId && a.barcodeId.trim() !== "")).length;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* 1. HEADER SECTION (DESKTOP & TABLET ADAPTIVE) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200/60 uppercase tracking-wider">
                <Building size={13} className="text-blue-600" />
                Structure & Aparatur Manage
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                Desktop / Tablet View
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Aparatur & Kelembagaan Desa
            </h1>
            <p className="text-slate-500 text-xs lg:text-sm font-normal leading-relaxed">
              Manajemen struktur organisasi desa, RT/RW, BPD, LPM, PKK, Posyandu, Karang Taruna, Puskesos, serta otomatisasi cetak ID Card & Barcode Absensi 2 sisi.
            </p>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Total Aparatur:</span>
                <span className="font-extrabold text-slate-900">{totalCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>SK Terbit:</span>
                <span className="font-extrabold text-emerald-700">{skCount}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Barcode Terverifikasi:</span>
                <span className="font-extrabold text-indigo-700">{withBarcodeCount || totalCount}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {isAdminMaster && (
            <div className="shrink-0">
              <button
                onClick={onAddClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#1d64ec] hover:bg-[#1554c9] active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all cursor-pointer group"
              >
                <UserPlus size={16} className="group-hover:rotate-12 transition-transform" />
                <span>+ Tambah Aparatur Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Dropdown Kategori Lembaga */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 shrink-0">
              <Filter size={15} className="text-blue-600" /> Kategori Lembaga:
            </span>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full md:w-72 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all cursor-pointer"
            >
              <option value="SEMUA">Semua Kategori (8 Lembaga)</option>
              {KATEGORI_LEMBAGA_LIST.map((kat, idx) => (
                <option key={idx} value={kat}>
                  {idx + 1}. {kat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box with Clear Button */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama / Jabatan / Barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Hapus Pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Pill Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 custom-scrollbar scroll-smooth">
          <button
            onClick={() => setSelectedKategori("SEMUA")}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedKategori === "SEMUA"
                ? "bg-[#1d64ec] text-white shadow-md shadow-blue-600/20"
                : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
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
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedKategori === kat
                    ? "bg-[#1d64ec] text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                <span>{kat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedKategori === kat
                      ? "bg-white/25 text-white font-black"
                      : "bg-slate-200 text-slate-600 font-semibold"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN TABLE CARD (RESPONSIVE TABLET WITH HORIZONTAL SCROLL) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
              Daftar Aparatur Desa
            </h2>
            <p className="text-slate-500 font-medium text-xs mt-0.5">
              Menampilkan <span className="font-bold text-slate-900">{filteredAparatur.length}</span> aparatur untuk kategori:{" "}
              <span className="font-bold text-blue-600">{selectedKategori}</span>
            </p>
          </div>
          <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-xs">
            <Briefcase size={20} />
          </div>
        </div>

        {/* TABLE CONTAINER WITH SMOOTH HORIZONTAL SCROLL FOR TABLET/DESKTOP */}
        <div className="overflow-x-auto custom-scrollbar -mx-6 lg:-mx-8 px-6 lg:px-8">
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[860px]">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-2">Aparatur & Jabatan</th>
                <th className="px-5 py-2">Kategori Lembaga</th>
                <th className="px-5 py-2">Barcode Absensi</th>
                <th className="px-5 py-2">Nomor SK</th>
                <th className="px-5 py-2 text-right">Aksi & Kartu</th>
              </tr>
            </thead>
            <tbody>
              {filteredAparatur.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <AlertCircle size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Tidak ada aparatur ditemukan</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Coba sesuaikan filter kategori lembaga atau gunakan kata kunci pencarian yang lain.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAparatur.map((person) => {
                  const barcodeCode = person.barcodeId || person.nik || `APR-DESA-${person.id.slice(0, 5)}`;
                  const kat = person.kategori || "Perangkat Desa";
                  const hasSK = Boolean(person.skNumber && person.skNumber.trim() !== "");

                  return (
                    <tr
                      key={person.id}
                      className="group transition-all hover:translate-y-[-1px]"
                    >
                      {/* 1. APARATUR & JABATAN */}
                      <td className="bg-white border-y border-l border-slate-200/80 rounded-l-2xl px-5 py-4 transition-colors group-hover:bg-slate-50/70 shadow-xs">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-slate-500 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden relative shrink-0 border border-slate-200/60 shadow-xs">
                            {person.photo ? (
                              <img
                                src={person.photo}
                                alt={person.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-extrabold uppercase">
                                {person.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {person.name}
                            </p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                              {person.position}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. KATEGORI LEMBAGA */}
                      <td className="bg-white border-y border-slate-200/80 px-5 py-4 transition-colors group-hover:bg-slate-50/70 shadow-xs">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50/70 text-blue-700 font-bold text-[11px] border border-blue-100">
                          {kat}
                        </span>
                      </td>

                      {/* 3. BARCODE ABSENSI */}
                      <td className="bg-white border-y border-slate-200/80 px-5 py-4 transition-colors group-hover:bg-slate-50/70 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100/80 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 tracking-wider">
                            {barcodeCode}
                          </span>
                          <button
                            onClick={() => onPrintCard(person)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/60 transition-colors cursor-pointer"
                            title="Lihat / Cetak ID Card Absensi"
                          >
                            <QrCode size={15} />
                          </button>
                        </div>
                      </td>

                      {/* 4. NOMOR SK */}
                      <td className="bg-white border-y border-slate-200/80 px-5 py-4 transition-colors group-hover:bg-slate-50/70 shadow-xs">
                        {hasSK ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-mono font-semibold">
                            <FileBadge2 size={13} className="text-emerald-600" />
                            <span>{person.skNumber}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200/60">
                            Belum Terbit
                          </span>
                        )}
                      </td>

                      {/* 5. AKSI & KARTU */}
                      <td className="bg-white border-y border-r border-slate-200/80 rounded-r-2xl px-5 py-4 text-right transition-colors group-hover:bg-slate-50/70 shadow-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* ID Card 2 Sisi */}
                          <button
                            onClick={() => onPrintCard(person)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                            title="Cetak ID Card Absensi 2 Sisi"
                          >
                            <Printer size={13} />
                            <span>ID Card (2 Sisi)</span>
                          </button>

                          {isAdminMaster && (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => onEditClick(person)}
                                className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200/60 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                                title="Edit Data Aparatur"
                              >
                                <Pencil size={15} />
                              </button>

                              {/* SK Management */}
                              <button
                                onClick={() => onSkClick(person)}
                                className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                                title="Kelola Dokumen SK"
                              >
                                <FileText size={15} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => onDeleteClick(person.id)}
                                className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200/60 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                                title="Hapus Data Aparatur"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
