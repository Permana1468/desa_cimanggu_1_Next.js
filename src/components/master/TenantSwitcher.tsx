"use client";

import React, { Suspense } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface TenantSwitcherProps {
  tenants: { id: string; name: string }[];
}

function TenantSwitcherContent({ tenants }: TenantSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTenantId = searchParams.get("tenantId") || "all";

  const handleSwitch = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") {
      params.delete("tenantId");
    } else {
      params.set("tenantId", id);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectedTenant = tenants.find(t => t.id === currentTenantId);

  return (
    <div className="relative group w-full">
      <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-transparent rounded-2xl transition-all hover:bg-white/5">
        <div className="w-8 h-8 shrink-0 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
          <Building2 size={18} />
        </div>
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wilayah</span>
          <span className="text-xs font-bold text-white truncate w-full text-left">
            {currentTenantId === "all" ? "Semua Wilayah" : selectedTenant?.name}
          </span>
        </div>
        <ChevronDown size={14} className="text-slate-500 group-hover:rotate-180 transition-transform duration-300" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] transform origin-top scale-95 group-hover:scale-100">
        <div className="px-4 py-3 border-b border-slate-50 mb-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Desa/Lembaga</p>
        </div>
        
        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => handleSwitch("all")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${currentTenantId === "all" ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            <span className="text-sm font-bold">Semua Wilayah (Global)</span>
            {currentTenantId === "all" && <Check size={16} />}
          </button>

          {tenants.map((t) => (
            <button 
              key={t.id}
              onClick={() => handleSwitch(t.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${currentTenantId === t.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <span className="text-sm font-bold">{t.name}</span>
              {currentTenantId === t.id && <Check size={16} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const TenantSwitcher = ({ tenants }: TenantSwitcherProps) => {
  return (
    <Suspense fallback={<div className="w-full h-12 bg-white/5 rounded-2xl animate-pulse" />}>
      <TenantSwitcherContent tenants={tenants} />
    </Suspense>
  );
};
