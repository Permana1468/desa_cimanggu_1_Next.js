"use client";

import { Printer } from "lucide-react";

export function PrintReceiptButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
    >
      <Printer size={15} />
      <span>Cetak Bon / Simpan PDF</span>
    </button>
  );
}

