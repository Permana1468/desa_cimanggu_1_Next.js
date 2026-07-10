"use client";

import { useState } from "react";
import { ClipboardList, Plus, Search } from "lucide-react";

export function PosyanduRegisterTab({ session }: any) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-rose-500" />
            Buku Register Digital (Format 1-7)
          </h2>
          <p className="text-slate-500 text-sm mt-1">Digitalisasi pendataan Ibu Hamil, Kelahiran, Kematian, dan Penimbangan Balita.</p>
        </div>
        <button className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-semibold text-xs shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Data Register
        </button>
      </div>

      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <ClipboardList className="w-16 h-16 text-slate-200 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Modul Sedang Dalam Pengembangan</h3>
        <p className="text-slate-500 text-sm max-w-md mt-2">
          Sistem pendataan Format 1 sampai 7 Posyandu sedang disinkronisasikan dengan struktur database utama.
        </p>
      </div>
    </div>
  );
}
