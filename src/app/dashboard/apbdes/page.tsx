"use client";

import React, { Suspense } from "react";
import { ApbdesTotalTab } from "@/components/dashboard/perencanaan/ApbdesTotalTab";

export default function ApbdesPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center font-bold text-slate-500">Memuat Laporan APBDes...</div>}>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <ApbdesTotalTab />
      </div>
    </Suspense>
  );
}
