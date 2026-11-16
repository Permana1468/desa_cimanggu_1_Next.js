"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  ArrowRight
} from "lucide-react";
import { getSuratListWithFilters } from "@/actions/village";
import { StatusSurat } from "@prisma/client";

export function SuratTrackingTab() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSurat, setSelectedSurat] = useState<any | null>(null);

  useEffect(() => {
    getSuratListWithFilters().then(data => {
      setSuratList(data);
      if (data.length > 0) {
        setSelectedSurat(data[0]);
      }
      setLoading(false);
    });
  }, []);

  const filteredSurat = suratList.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.jenisSurat?.toLowerCase().includes(q) ||
      s.nomorSurat?.toLowerCase().includes(q) ||
      s.warga?.namaLengkap?.toLowerCase().includes(q) ||
      s.warga?.nik?.includes(q)
    );
  });

  const getTimelineSteps = (surat: any) => {
    const isApproved = surat?.status === StatusSurat.DISETUJUI;
    const isVerified = surat?.status === StatusSurat.TERVERIFIKASI || isApproved;
    const isRejected = surat?.status === StatusSurat.DITOLAK;

    return [
      {
        title: "1. Pengajuan Permohonan",
        desc: "Permohonan surat didaftarkan ke sistem desa",
        date: surat?.createdAt ? new Date(surat.createdAt).toLocaleDateString("id-ID") : "-",
        done: true,
        current: false
      },
      {
        title: "2. Verifikasi Pengantar RT / RW",
        desc: "Pengecekan kesesuaian domisili dan pengantar wilayah",
        date: isVerified ? "Terverifikasi" : isRejected ? "Ditolak" : "Sedang diproses",
        done: isVerified,
        current: !isVerified && !isRejected
      },
      {
        title: "3. Validasi & Penomoran Desa",
        desc: "Verifikasi berkas persyaratan oleh Kasi Pelayanan Desa",
        date: isApproved ? (surat?.nomorSurat ? `No: ${surat.nomorSurat}` : "Tervalidasi") : "-",
        done: isApproved,
        current: isVerified && !isApproved && !isRejected
      },
      {
        title: "4. Tanda Tangan & Cap Resmi Desa",
        desc: "Pemberian tanda tangan fisik / basah & cap dinas resmi desa (Kades / Sekdes)",
        date: isApproved ? "Ditandatangani" : "-",
        done: isApproved,
        current: false
      },
      {
        title: "5. Dokumen Selesai",
        desc: "Surat siap diambil fisik di loket pelayanan kantor desa",
        date: isApproved ? "Siap Diambil" : "-",
        done: isApproved,
        current: isApproved
      }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">Pelacakan Alur & Progres Layanan</h3>
            <p className="text-xs text-slate-400">Pantau transparansi tahapan pemrosesan surat warga dari RT/RW hingga Kepala Desa.</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari NIK / Pemohon / No Surat..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#f4f7fc] border border-transparent focus:border-indigo-400 focus:bg-white rounded-full text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Grid: Master List on Left, Active Tracking Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Daftar Permohonan ({filteredSurat.length})
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white rounded-3xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : filteredSurat.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-slate-400 text-xs font-bold border border-slate-100">
              Tidak ada data permohonan yang sesuai.
            </div>
          ) : (
            filteredSurat.map(item => {
              const isSelected = selectedSurat?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedSurat(item)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-indigo-50/60 border-indigo-200 shadow-xs"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {item.jenisSurat}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.status === StatusSurat.DISETUJUI
                          ? "bg-emerald-100 text-emerald-700"
                          : item.status === StatusSurat.DITOLAK
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-bold truncate">
                      {item.warga?.namaLengkap || "Warga"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      NIK: {item.warga?.nik || "-"}
                    </p>
                  </div>
                  <ArrowRight size={16} className={`shrink-0 ${isSelected ? "text-indigo-600 translate-x-0.5" : "text-slate-300"}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Timeline */}
        <div className="lg:col-span-7">
          {selectedSurat ? (
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-slate-200/60 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    Detail Pelacakan
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    {selectedSurat.jenisSurat}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Pemohon: <b className="text-slate-800">{selectedSurat.warga?.namaLengkap}</b> (NIK: {selectedSurat.warga?.nik})
                  </p>
                </div>

                {selectedSurat.nomorSurat && (
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Nomor Register</span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60 inline-block">
                      {selectedSurat.nomorSurat}
                    </span>
                  </div>
                )}
              </div>

              {/* Stepper Timeline */}
              <div className="space-y-6 pl-2">
                {getTimelineSteps(selectedSurat).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative">
                    {/* Connecting line */}
                    {idx < 4 && (
                      <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                        step.done ? "bg-emerald-500" : "bg-slate-200"
                      }`} />
                    )}

                    {/* Step Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs shadow-xs ${
                      step.done
                        ? "bg-emerald-500 text-white"
                        : step.current
                        ? "bg-indigo-600 text-white animate-pulse"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {step.done ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>

                    {/* Step Text */}
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-black ${
                          step.done ? "text-slate-900" : step.current ? "text-indigo-600 font-black" : "text-slate-400"
                        }`}>
                          {step.title}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {step.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-12 text-center text-slate-400 font-bold text-xs border border-slate-200/60">
              Pilih permohonan surat di sebelah kiri untuk melihat pelacakan progres.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
