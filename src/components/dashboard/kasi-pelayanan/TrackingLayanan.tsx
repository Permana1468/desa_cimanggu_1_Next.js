"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  History, 
  CheckCircle2, 
  Activity, 
  AlertCircle,
  Sparkles,
  RefreshCw,
  Stamp,
  MessageSquare,
  X,
  Loader2,
  Send,
  Clock
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { 
  getDocumentTrackingList, 
  searchDocumentTracking, 
  updateDocumentTrackingStatus,
  DocumentTrackingItem 
} from "@/actions/pelayanan";

export function TrackingLayanan({ session }: { session: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingList, setTrackingList] = useState<DocumentTrackingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DocumentTrackingItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status Action Modal
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    actionType: "SEDANG_DIPROSES" | "SELESAI";
    resi: string;
  }>({
    isOpen: false,
    actionType: "SEDANG_DIPROSES",
    resi: "",
  });
  const [customCatatan, setCustomCatatan] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchTrackingList = useCallback(async () => {
    try {
      const res = await getDocumentTrackingList();
      if (res.success) {
        setTrackingList(res.data);
        if (!selectedItem && res.data.length > 0) {
          setSelectedItem(res.data[0]);
        } else if (selectedItem) {
          const fresh = res.data.find((d) => d.resi === selectedItem.resi);
          if (fresh) setSelectedItem(fresh);
        }
      }
    } catch (err) {
      console.error("Failed to load tracking list:", err);
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchTrackingList();
    const interval = setInterval(() => {
      fetchTrackingList();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchTrackingList]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      fetchTrackingList();
      return;
    }

    setSearching(true);
    setErrorMessage(null);
    const res = await searchDocumentTracking(searchQuery);
    setSearching(false);

    if (res.success && res.result) {
      setSelectedItem(res.result);
    } else {
      setErrorMessage(res.message || "Dokumen tidak ditemukan");
    }
  };

  const handleOpenActionModal = (actionType: "SEDANG_DIPROSES" | "SELESAI") => {
    if (!selectedItem) return;
    const defaultText =
      actionType === "SELESAI"
        ? "Surat telah ditandatangani manual & dicap basah. Silakan pemohon mengambil berkas fisik asli di Loket Pelayanan Kantor Desa."
        : `Dokumen sedang diajukan ke meja ${selectedItem.penandatangan === "SEKDES" ? "Sekdes" : "Kades"} untuk penandatanganan manual dan cap stempel basah desa.`;

    setCustomCatatan(defaultText);
    setActionModal({
      isOpen: true,
      actionType,
      resi: selectedItem.resi,
    });
  };

  const handleConfirmUpdate = async () => {
    if (!actionModal.resi) return;
    setUpdatingStatus(true);
    const res = await updateDocumentTrackingStatus({
      resi: actionModal.resi,
      action: actionModal.actionType,
      catatan: customCatatan,
    });
    setUpdatingStatus(false);

    if (res.success && res.item) {
      setSelectedItem(res.item);
      setActionModal({ isOpen: false, actionType: "SEDANG_DIPROSES", resi: "" });
      fetchTrackingList();
      setToastMsg(
        actionModal.actionType === "SELESAI"
          ? "Status berhasil diubah menjadi: SELESAI (Siap Diambil di Desa)"
          : "Status berhasil diubah menjadi: SEDANG DIPROSES (Pengajuan TTD Manual)"
      );
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-sm font-bold"
          >
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800">Tracking Layanan Dokumen</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Resi Terpadu
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Pelacakan posisi tahapan berkas, verifikasi fisik, paraf kasi, dan pengajuan TTD manual Kades/Sekdes.
          </p>
        </div>

        <button
          onClick={() => fetchTrackingList()}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw size={14} />
          <span>Segarkan Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Search Bar & Timeline Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Box Banner */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 rounded-[2rem] p-8 shadow-xl shadow-blue-700/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-[70px] -mr-24 -mt-24 pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-black uppercase tracking-widest text-cyan-200 mb-2">
                <Sparkles size={12} className="text-yellow-300" />
                <span>Pelacakan Nomor Resi Digital</span>
              </div>
              <h2 className="text-2xl font-black mb-1">Cari Posisi Berkas Warga</h2>
              <p className="text-blue-100 text-xs md:text-sm mb-6 max-w-lg">
                Masukkan nomor resi (contoh: <strong>TRK-CMG-202611-001</strong>), NIK 16 digit, atau nama pemohon untuk melacak linimasa pelayanan.
              </p>

              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Contoh: TRK-CMG-202611-001 atau 3201..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-900 font-bold focus:ring-4 focus:ring-blue-400/50 outline-none transition-all shadow-md text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
                >
                  <Search size={16} />
                  <span>{searching ? "Mencari..." : "Lacak"}</span>
                </button>
              </form>

              {errorMessage && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/20 border border-red-300/30 text-xs text-red-100 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Document Timeline Detail */}
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-7 md:p-8 shadow-sm border border-slate-100 space-y-6"
            >
              {/* Document Overview Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                      {selectedItem.resi}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      {selectedItem.nomorSurat}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      TTD: {selectedItem.penandatangan === "SEKDES" ? "Sekdes (a.n. Kades)" : "Kepala Desa"}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1.5">
                    {selectedItem.namaDokumen}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pemohon: <strong className="text-slate-800">{selectedItem.namaPemohon}</strong> (NIK: {selectedItem.nik || "-"})
                  </p>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${
                    selectedItem.progressPercent === 100
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    <Activity size={13} className="animate-pulse" />
                    <span>{selectedItem.statusUtama}</span>
                  </span>
                  <div className="text-[11px] text-slate-400 font-semibold mt-1">
                    Pembaruan: {selectedItem.lastUpdated}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: SEDANG DIPROSES & SELESAI DIPROSES */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-800">Tindak Lanjut Dokumen Fisik:</span> Perbarui status verifikasi & penandatanganan manual.
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleOpenActionModal("SEDANG_DIPROSES")}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white font-extrabold text-xs transition-colors border border-amber-200 hover:border-transparent flex items-center justify-center gap-1.5"
                  >
                    <Clock size={14} />
                    <span>Sedang Diproses</span>
                  </button>

                  <button
                    onClick={() => handleOpenActionModal("SELESAI")}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Selesai Diproses</span>
                  </button>
                </div>
              </div>

              {/* Catatan Petugas Banner */}
              {selectedItem.catatanPetugas && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 flex items-start gap-3">
                  <MessageSquare size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black text-xs text-blue-950 uppercase tracking-wider">Catatan Petugas / Tindak Lanjut</h5>
                    <p className="text-xs text-blue-900 mt-1 leading-relaxed font-medium">
                      {selectedItem.catatanPetugas}
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 mb-2">
                  <span>Progres Kelengkapan & Penandatanganan Manual</span>
                  <span className="text-blue-600">{selectedItem.progressPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${selectedItem.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Step-by-Step Linimasa */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Tahapan Alur Pelayanan Persuratan (TTD Manual)
                </h4>

                <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedItem.steps.map((st) => (
                    <div key={st.stepIndex} className="relative flex items-start gap-4 group">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 z-10 border-2 ${
                        st.status === "completed"
                          ? "bg-emerald-500 border-white text-white shadow-md shadow-emerald-500/30"
                          : st.status === "current"
                          ? "bg-blue-600 border-white text-white shadow-md shadow-blue-600/30 animate-pulse"
                          : "bg-slate-100 border-white text-slate-400"
                      }`}>
                        {st.status === "completed" ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          st.stepIndex
                        )}
                      </div>

                      <div className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                        st.status === "current"
                          ? "bg-blue-50/60 border-blue-200 shadow-sm"
                          : st.status === "completed"
                          ? "bg-slate-50/80 border-slate-200/70"
                          : "bg-white border-slate-100 opacity-60"
                      }`}>
                        <div className="flex items-center justify-between">
                          <h5 className="font-black text-sm text-slate-800">{st.title}</h5>
                          {st.completedAt && (
                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                              {st.completedAt}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {st.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Live Tracked Documents Queue */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <History size={16} className="text-blue-600" />
                <span>Dokumen Dalam Proses</span>
              </h3>
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {trackingList.length} Aktif
              </span>
            </div>

            <div className="space-y-3">
              {trackingList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedItem?.id === item.id
                      ? "bg-blue-50/70 border-blue-400 shadow-sm"
                      : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-black text-xs text-blue-700">{item.resi}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.progressPercent === 100
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {item.progressPercent}%
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-800">{item.namaDokumen}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Pemohon: {item.namaPemohon}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-wider">
              <Stamp size={16} />
              <span>SOP Penandatanganan Fisik</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Meskipun administrasi berbasis digital, berkas surat tetap dicetak fisik dan wajib dibubuhi tanda tangan manual oleh <strong>Kepala Desa</strong> atau <strong>Sekretaris Desa</strong> serta cap stempel basah desa.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL UPDATE STATUS & CATATAN */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    actionModal.actionType === "SELESAI"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {actionModal.actionType === "SELESAI" ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {actionModal.actionType === "SELESAI"
                        ? "Tandai Dokumen Selesai Diproses"
                        : "Tandai Dokumen Sedang Diproses"}
                    </h3>
                    <p className="text-[11px] text-slate-500">Resi: {actionModal.resi}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActionModal({ isOpen: false, actionType: "SEDANG_DIPROSES", resi: "" })}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Catatan Tindak Lanjut untuk Pemohon / Warga *
                </label>
                <textarea
                  rows={3}
                  value={customCatatan}
                  onChange={(e) => setCustomCatatan(e.target.value)}
                  placeholder="Ketik catatan pengambilan atau status dokumen..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-relaxed"
                />

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Silakan ambil di Kantor Desa.",
                    "Surat selesai ditandatangani Kades & dicap basah.",
                    "Sedang diajukan ke meja Sekdes.",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCustomCatatan(preset)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 font-bold transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActionModal({ isOpen: false, actionType: "SEDANG_DIPROSES", resi: "" })}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={handleConfirmUpdate}
                  className={`flex-1 py-3 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    actionModal.actionType === "SELESAI"
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                  }`}
                >
                  {updatingStatus ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  <span>Simpan & Perbarui Status</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
