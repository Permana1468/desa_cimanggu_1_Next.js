"use client";

import { useState, useEffect, useRef } from "react";
import { searchWargaForPuskesos } from "@/actions/puskesos";
import { Search, UserCheck, Loader2 } from "lucide-react";

interface CitizenSearchInputProps {
  tenantId?: string;
  onSelect: (citizen: any) => void;
  selectedNik?: string;
  placeholder?: string;
  required?: boolean;
}

export function CitizenSearchInput({
  tenantId,
  onSelect,
  selectedNik,
  placeholder = "Ketik Nama atau NIK warga...",
  required = true
}: CitizenSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchWargaForPuskesos(query, tenantId);
        setResults(res);
        setIsOpen(true);
      } catch (e) {
        console.error("Gagal mencari warga:", e);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, tenantId]);

  const handleSelectCitizen = (citizen: any) => {
    setSelectedCitizen(citizen);
    setQuery(`${citizen.namaLengkap} (${citizen.nik})`);
    setIsOpen(false);
    onSelect(citizen);
  };

  const handleClear = () => {
    setSelectedCitizen(null);
    setQuery("");
    setResults([]);
    onSelect(null);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          required={required && !selectedCitizen}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedCitizen) setSelectedCitizen(null);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={16} />
        )}
        {selectedCitizen && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200"
          >
            &times;
          </button>
        )}
      </div>

      {/* Selected badge */}
      {selectedCitizen && (
        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">{selectedCitizen.namaLengkap}</span>
              <span className="font-mono text-[11px] text-emerald-600 ml-1.5">({selectedCitizen.nik})</span>
              <div className="text-[10px] text-emerald-700 mt-0.5">
                {selectedCitizen.alamat || "Desa Cimanggu I"} RT {selectedCitizen.rt || "-"}/RW {selectedCitizen.rw || "-"}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[9px] font-black uppercase">
            Terverifikasi
          </span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
          {results.map((citizen) => (
            <div
              key={citizen.id}
              onClick={() => handleSelectCitizen(citizen)}
              className="p-3 hover:bg-blue-50/70 transition-colors cursor-pointer text-left"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-xs text-slate-800">{citizen.namaLengkap}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                  RT {citizen.rt || "-"}/RW {citizen.rw || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-1">
                <span>NIK: {citizen.nik}</span>
                <span>•</span>
                <span className="truncate max-w-[180px]">{citizen.alamat || "Desa Cimanggu I"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 left-0 right-0 mt-1 p-3 bg-white border border-slate-200 rounded-xl shadow-xl text-center text-xs text-slate-400">
          Warga dengan nama/NIK tersebut tidak ditemukan di sensus kependudukan.
        </div>
      )}
    </div>
  );
}

