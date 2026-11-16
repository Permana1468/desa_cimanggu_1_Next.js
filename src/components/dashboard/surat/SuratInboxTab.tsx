"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Inbox, 
  Search, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  Eye, 
  RefreshCw,
  Loader2
} from "lucide-react";
import { getSuratListWithFilters, updateSuratStatus } from "@/actions/village";
import { StatusSurat } from "@prisma/client";

function generateDefaultNomorSurat() {
  const code = (Date.now() % 900) + 100;
  return `470/${code}/Pem-Ds/${new Date().getFullYear()}`;
}

export function SuratInboxTab() {
  const [suratList, setSuratList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedSuratDetail, setSelectedSuratDetail] = useState<any | null>(null);

  const fetchLetters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSuratListWithFilters(statusFilter, search);
      setSuratList(data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const handleUpdateStatus = async (id: string, newStatus: StatusSurat) => {
    let nomorSurat = undefined;
    if (newStatus === StatusSurat.DISETUJUI) {
      const defaultNomor = generateDefaultNomorSurat();
      const input = prompt("Masukkan Nomor Surat Resmi untuk persetujuan:", defaultNomor);
      if (!input) return;
      nomorSurat = input;
    } else if (newStatus === StatusSurat.DITOLAK) {
      if (!confirm("Yakin ingin menolak permohonan surat ini?")) return;
    }

    setActionLoadingId(id);
    try {
      await updateSuratStatus(id, newStatus, nomorSurat);
      await fetchLetters();
    } catch (e: any) {
      alert("Gagal memperbarui status: " + (e.message || "Kesalahan sistem"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = suratList.filter(s => s.status === StatusSurat.TERTUNDA).length;

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1d64ec] flex items-center justify-center shrink-0">
            <Inbox size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">Antrean Permohonan Masuk</h3>
            <p className="text-xs text-slate-400">
              {pendingCount > 0 ? (
                <span className="text-rose-600 font-bold">{pendingCount} permohonan menunggu tindakan</span>
              ) : (
                "Semua permohonan telah diproses"
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Pills Filter */}
          <div className="flex bg-[#f4f7fc] p-1 rounded-full border border-slate-200/60 text-xs">
            {[
              { key: "ALL", label: "Semua" },
              { key: StatusSurat.TERTUNDA, label: "Menunggu" },
              { key: StatusSurat.TERVERIFIKASI, label: "Terverifikasi" },
              { key: StatusSurat.DISETUJUI, label: "Disetujui" },
              { key: StatusSurat.DITOLAK, label: "Ditolak" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[#1d64ec] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative flex-1 md:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIK, pemohon, jenis..."
              className="w-full pl-9 pr-4 py-2 bg-[#f4f7fc] border border-transparent focus:border-blue-400 focus:bg-white rounded-full text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={fetchLetters}
            disabled={loading}
            title="Muat Ulang Data"
            className="p-2 rounded-full bg-[#f4f7fc] hover:bg-slate-200/60 text-slate-600 transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Letters List / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : suratList.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200/60 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <FileText size={28} />
          </div>
          <h4 className="text-base font-black text-slate-800">Tidak ada permohonan surat</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "Tidak ditemukan permohonan surat dengan kata kunci atau filter status tersebut."
              : "Belum ada permohonan surat masuk baru dari warga atau pengurus RT/RW."}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {suratList.map((item) => {
            const isActionLoading = actionLoadingId === item.id;
            const rt = item.warga?.rt ? String(item.warga.rt).padStart(3, "0") : "-";
            const rw = item.warga?.rw ? String(item.warga.rw).padStart(3, "0") : "-";

            let statusBadge = (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200">
                Menunggu Verifikasi
              </span>
            );
            if (item.status === StatusSurat.TERVERIFIKASI) {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  Terverifikasi RT/RW
                </span>
              );
            } else if (item.status === StatusSurat.DISETUJUI) {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Disetujui Desa
                </span>
              );
            } else if (item.status === StatusSurat.DITOLAK) {
              statusBadge = (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                  Ditolak
                </span>
              );
            }

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d64ec] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={22} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-slate-900">
                        {item.jenisSurat}
                      </span>
                      {statusBadge}
                      {item.nomorSurat && (
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          No: {item.nomorSurat}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold flex-wrap">
                      <span className="text-slate-900 font-bold">{item.warga?.namaLengkap || "Warga Desa"}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono text-slate-500">NIK: {item.warga?.nik || "-"}</span>
                      <span className="text-slate-400">•</span>
                      <span>Wilayah RT.{rt} / RW.{rw}</span>
                    </div>

                    {item.keperluan && (
                      <p className="text-xs text-slate-500 italic">
                        Keperluan: &quot;{item.keperluan}&quot;
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Clock size={12} />
                      <span>Diajukan: {new Date(item.createdAt).toLocaleString("id-ID")}</span>
                      {item.admin?.fullName && (
                        <>
                          <span>•</span>
                          <span>Pencatat: {item.admin.fullName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => setSelectedSuratDetail(item)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Detail Isian"
                  >
                    <Eye size={15} />
                    <span className="hidden sm:inline">Detail</span>
                  </button>

                  {item.status !== StatusSurat.DISETUJUI && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, StatusSurat.DISETUJUI)}
                      disabled={isActionLoading}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                      <span>Setujui & Terbitkan</span>
                    </button>
                  )}

                  {item.status !== StatusSurat.DITOLAK && (
                    <button
                      onClick={() => handleUpdateStatus(item.id, StatusSurat.DITOLAK)}
                      disabled={isActionLoading}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      <span>Tolak</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSuratDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-7 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Detail Permohonan Surat
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedSuratDetail.jenisSurat} • {selectedSuratDetail.warga?.namaLengkap}
                </p>
              </div>
              <button
                onClick={() => setSelectedSuratDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pemohon</span>
                <p className="font-bold text-slate-800 text-sm">{selectedSuratDetail.warga?.namaLengkap}</p>
                <p className="text-slate-500 font-mono">NIK: {selectedSuratDetail.warga?.nik}</p>
                <p className="text-slate-500">Alamat: {selectedSuratDetail.warga?.alamat || "Desa Cimanggu I"}</p>
              </div>

              {selectedSuratDetail.isianData && (
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Isian Form Tambahan</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedSuratDetail.isianData).map(([k, v]) => (
                      <div key={k} className="p-2 bg-white rounded-xl border border-blue-100/60">
                        <span className="text-[9px] font-bold text-slate-400 uppercase truncate block">{k.replace(/_/g, " ")}</span>
                        <span className="font-bold text-slate-800 text-xs block">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSuratDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
