"use client";

import { useState, useEffect, useRef } from "react";
import { Search, UserCheck, Loader2, X } from "lucide-react";
import { searchWargaForPosyandu } from "@/actions/posyandu";

interface CitizenSearchAutocompleteProps {
  onSelect: (citizen: any) => void;
  placeholder?: string;
  posyanduFilter?: string;
  label?: string;
}

export function CitizenSearchAutocomplete({
  onSelect,
  placeholder = "Ketik NIK atau Nama Warga dari Data Kependudukan...",
  posyanduFilter,
  label = "Integrasi Data Kependudukan (Cari NIK / Nama)"
}: CitizenSearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchWargaForPosyandu(query, posyanduFilter);
        setResults(res || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Search citizen error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, posyanduFilter]);

  const handleSelect = (citizen: any) => {
    setSelectedCitizen(citizen);
    setQuery(citizen.namaLengkap);
    setIsOpen(false);
    onSelect(citizen);
  };

  const handleClear = () => {
    setSelectedCitizen(null);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-teal-800 mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {selectedCitizen && (
            <span className="text-[11px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
              <UserCheck size={12} /> Data Terhubung
            </span>
          )}
        </label>
      )}

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-9 pr-9 py-2 rounded-xl text-sm border outline-none transition-all ${
            selectedCitizen
              ? "border-teal-500 bg-teal-50/30 text-slate-900 font-medium"
              : "border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          }`}
        />
        {loading && (
          <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 animate-spin" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors flex items-start justify-between gap-3"
            >
              <div>
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  {item.namaLengkap}
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {item.jenisKelamin === "LAKI_LAKI" || item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  NIK: {item.nik} | Tgl Lahir: {new Date(item.tanggalLahir).toLocaleDateString("id-ID")}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Ibu: {item.namaIbu || "-"} | RT {item.rt} / RW {item.rw} ({item.dusun || "Dusun"})
                </div>
              </div>
              <span className="text-xs text-teal-600 font-semibold self-center whitespace-nowrap bg-teal-50 px-2 py-1 rounded-lg">
                Pilih
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && !loading && results.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-xs text-slate-500">
          Tidak ada data kependudukan cocok dengan "{query}". Silakan isi form secara manual.
        </div>
      )}
    </div>
  );
}
