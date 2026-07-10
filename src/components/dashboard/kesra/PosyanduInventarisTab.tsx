"use client";

import { useState } from "react";
import { Archive, Plus } from "lucide-react";

export function PosyanduInventarisTab({ session }: any) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Archive className="w-6 h-6 text-rose-500" />
            Manajemen Inventaris Posyandu
          </h2>
          <p className="text-slate-500 text-sm mt-1">Mencatat aset, alat ukur (antropometri), timbangan, dan barang-barang posyandu lainnya.</p>
        </div>
        <button className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Barang
        </button>
      </div>

      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <Archive className="w-16 h-16 text-slate-200 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Modul Sedang Dalam Pengembangan</h3>
        <p className="text-slate-500 text-sm max-w-md mt-2">
          Sistem manajemen aset dan inventaris Posyandu akan segera hadir di sini.
        </p>
      </div>
    </div>
  );
}
