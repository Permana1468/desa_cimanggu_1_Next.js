"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Banknote, 
  Layers, 
  Plus, 
  RefreshCw,
  Send,
  Layers3
} from "lucide-react";
import { UsulanItem } from "../../perencanaan/DraftUsulanRw";

export default function MusrenbangFormClient({ desaName }: { desaName: string }) {
  const [selectedRw, setSelectedRw] = useState("009");
  const [items, setItems] = useState<UsulanItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filterSifat, setFilterSifat] = useState<"ALL" | "BARU" | "LAMA" | "REHAB">("ALL");

  const rwList = ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010"];

  const loadRekapanForRw = (rwNo: string) => {
    try {
      const activeRw = rwNo.trim();
      const aggregated: UsulanItem[] = [];
      const seenIds = new Set<string>();

      // 1. Scan RT sent items for selected RW (priority 1)
      for (let r = 1; r <= 30; r++) {
        const rtStr = String(r).padStart(3, "0");
        const sentKey = `musling_sent_usulan_rt_${rtStr}_rw_${activeRw}_v1`;
        const savedSent = localStorage.getItem(sentKey);
        if (savedSent) {
          try {
            const parsed = JSON.parse(savedSent);
            if (Array.isArray(parsed.items)) {
              parsed.items.forEach((item: UsulanItem) => {
                if (!seenIds.has(item.id)) {
                  seenIds.add(item.id);
                  aggregated.push(item);
                }
              });
            }
          } catch (err) {}
        }

        // 2. Scan RT draft items for selected RW (priority 2)
        const rtKey = `musling_draft_usulan_items_rt_${rtStr}_rw_${activeRw}_v1`;
        const savedRtItems = localStorage.getItem(rtKey);
        if (savedRtItems) {
          try {
            const parsedRt: UsulanItem[] = JSON.parse(savedRtItems);
            parsedRt.forEach((item: UsulanItem) => {
              if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                aggregated.push(item);
              }
            });
          } catch (err) {}
        }
      }

      // 3. Scan RW direct items
      const rwKey = `musling_draft_usulan_items_rw_${activeRw}_v1`;
      const savedRwItems = localStorage.getItem(rwKey);
      if (savedRwItems) {
        try {
          const parsedRw: UsulanItem[] = JSON.parse(savedRwItems);
          parsedRw.forEach((item: UsulanItem) => {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              aggregated.push(item);
            }
          });
        } catch (err) {}
      }

      setItems(aggregated);
    } catch (err) {
      console.error("Error loading Rekapan Usulan for RW:", err);
    }
  };

  useEffect(() => {
    loadRekapanForRw(selectedRw);
    setMounted(true);
  }, [selectedRw]);

  const filteredItems = items.filter(item => {
    if (filterSifat === "ALL") return true;
    return item.sifatKegiatan === filterSifat;
  });

  const totalBiaya = filteredItems.reduce((acc, curr) => acc + (Number(curr.besarnyaBiaya) || 0), 0);
  const totalBaru = items.filter(i => i.sifatKegiatan === "BARU").length;
  const totalRehab = items.filter(i => i.sifatKegiatan === "REHAB").length;
  const totalLama = items.filter(i => i.sifatKegiatan === "LAMA").length;

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* FILTER & SELECTOR BAR */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
            RW
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pilih Wilayah RW</label>
            <select
              value={selectedRw}
              onChange={(e) => setSelectedRw(e.target.value)}
              className="bg-white font-bold text-slate-800 text-sm rounded-lg px-3 py-1.5 border border-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {rwList.map((rw) => (
                <option key={rw} value={rw}>
                  RW {rw} - Desa {desaName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadRekapanForRw(selectedRw)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Muat Ulang Data</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span>Cetak Rekapan RW {selectedRw}</span>
          </button>
        </div>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Usulan</span>
            <Layers size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{items.length}</div>
          <p className="text-[10px] text-slate-400 mt-1">Item Usulan dari RT & RW</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Biaya (RAB)</span>
            <Banknote size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 truncate">
            Rp {totalBiaya.toLocaleString("id-ID")}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Estimasi Total Anggaran</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Pembangunan Fisik</span>
            <Sparkles size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{totalBaru + totalRehab}</div>
          <p className="text-[10px] text-slate-400 mt-1">{totalBaru} Baru | {totalRehab} Rehab</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Pembangunan Non-Fisik</span>
            <Building2 size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{totalLama}</div>
          <p className="text-[10px] text-slate-400 mt-1">Kegiatan Rutin / Lainnya</p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex items-center gap-2 no-print">
        <span className="text-xs font-bold text-slate-500 mr-1">Filter Sifat:</span>
        {(["ALL", "BARU", "REHAB", "LAMA"] as const).map((sifat) => (
          <button
            key={sifat}
            onClick={() => setFilterSifat(sifat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterSifat === sifat
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {sifat === "ALL" ? "Semua Sifat" : sifat}
          </button>
        ))}
      </div>

      {/* TABLE REKAPAN USULAN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">
              Rekapan Usulan Musrenbang RW {selectedRw}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Data Usulan Pembangunan Fisik & Non-Fisik Yang Terdaftar Dari Seluruh RT Wilayah RW {selectedRw}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Tersinkronikasi Terpisah Per RW</span>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Layers3 size={48} className="mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-600">Belum Ada Usulan dari RT / RW {selectedRw}</p>
            <p className="text-xs max-w-md mx-auto">
              Saat pengurus RT di RW {selectedRw} menekan tombol &quot;Kirim Hasil Usulan ke RW&quot;, usulannya akan otomatis tampil di tabel rekapan ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-800 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 text-center w-12">No</th>
                  <th className="py-3.5 px-4">Jenis Kegiatan Usulan</th>
                  <th className="py-3.5 px-4 text-center w-32">Volume</th>
                  <th className="py-3.5 px-4 text-center w-28">Sifat</th>
                  <th className="py-3.5 px-4 text-right w-44">Besarnya Biaya (Rp)</th>
                  <th className="py-3.5 px-4">Keterangan / Pengusul</th>
                  <th className="py-3.5 px-4 text-center w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/80 transition-colors font-medium">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.jenisKegiatan}</td>
                    <td className="py-3.5 px-4 text-center font-semibold">{item.volume || "-"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          item.sifatKegiatan === "BARU"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.sifatKegiatan === "REHAB"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.sifatKegiatan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {item.besarnyaBiaya ? `Rp ${Number(item.besarnyaBiaya).toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{item.keterangan || "-"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        <span>Terverifikasi</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
