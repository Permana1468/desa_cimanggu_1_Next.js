"use client";

import { useState } from "react";
import { PhysicalMutationItem, completePhysicalMutation } from "@/actions/mutasiFisik";
import { CheckCircle2, X, Archive, AlertCircle, Loader2, FileCheck, CheckSquare, ShieldCheck } from "lucide-react";

export function VerifyPhysicalMutationModal({
  item,
  onClose,
  onSuccess,
}: {
  item: PhysicalMutationItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [lokasiArsip, setLokasiArsip] = useState("Lemari Arsip 01 - Box Mutasi 2026");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default checklists based on mutation type
  const [checkPengantar, setCheckPengantar] = useState(true);
  const [checkDokumenAsli, setCheckDokumenAsli] = useState(true);
  const [checkKtpDitarik, setCheckKtpDitarik] = useState(item.type === "death");
  const [checkBukuInduk, setCheckBukuInduk] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lokasiArsip.trim()) {
      setError("Mohon isi nomor lemari / lokasi map arsip fisik untuk pencatatan inventaris.");
      return;
    }

    setLoading(true);
    setError(null);

    const checklist: string[] = [];
    if (checkPengantar) checklist.push("SURAT_PENGANTAR_RT_ASLI");
    if (checkDokumenAsli) checklist.push(item.type === "death" ? "SURAT_KEMATIAN_RS_PUSKESMAS" : "SURAT_KETERANGAN_PINDAH_ASLI");
    if (checkKtpDitarik) checklist.push("KTP_LAMA_DITARIK");
    if (checkBukuInduk) checklist.push("BUKU_INDUK_MUTASI_DESA_DICATAT");

    const res = await completePhysicalMutation({
      id: item.id,
      type: item.type,
      lokasiArsipFisik: lokasiArsip,
      catatanVerifikasi: catatan || undefined,
      checklist,
    });

    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || "Gagal menyelesaikan verifikasi berkas fisik.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Verifikasi Berkas Fisik</h3>
              <p className="text-xs text-blue-100 mt-0.5">Rekonsiliasi Administrasi Kependudukan Desa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Citizen & Mutation Info Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Laporan dari RT {item.rt} / RW {item.rw}
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  item.type === "death"
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}
              >
                {item.typeLabel}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900">{item.namaLengkap}</div>
            {item.nik && (
              <div className="text-xs font-mono text-slate-600">NIK: {item.nik}</div>
            )}
            <div className="text-xs text-slate-500">{item.detail}</div>
            <div className="text-[11px] text-slate-400 pt-1">
              Tanggal Kejadian: <strong className="text-slate-700">{item.tanggalKejadian}</strong> | Dilaporkan: {item.tanggalLapor}
            </div>
          </div>

          {/* Checklist Penerimaan Dokumen Fisik */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileCheck size={16} className="text-blue-600" />
              <span>Checklist Dokumen Fisik Diterima di Meja Pelayanan:</span>
            </label>
            <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={checkPengantar}
                  onChange={(e) => setCheckPengantar(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Surat Pengantar RT Asli bertanda tangan basah</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={checkDokumenAsli}
                  onChange={(e) => setCheckDokumenAsli(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>
                  {item.type === "death"
                    ? "Surat Kematian RS / Puskesmas / Surat Keterangan Dokter"
                    : "Surat Keterangan Pindah / SKPWNI / Dokumen Bukti Alamat Asli"}
                </span>
              </label>

              {item.type === "death" && (
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={checkKtpDitarik}
                    onChange={(e) => setCheckKtpDitarik(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>KTP Elektronik Asli lama telah ditarik / dinonaktifkan</span>
                </label>
              )}

              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={checkBukuInduk}
                  onChange={(e) => setCheckBukuInduk(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Buku Induk & Buku Mutasi Penduduk Desa telah dicatat/diperbarui</span>
              </label>
            </div>
          </div>

          {/* Lokasi Arsip Fisik */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Archive size={15} className="text-indigo-600" />
              <span>Lokasi Penyimpanan Berkas Fisik (Rak / Map Arsip):</span>
            </label>
            <input
              type="text"
              value={lokasiArsip}
              onChange={(e) => setLokasiArsip(e.target.value)}
              placeholder="Contoh: Lemari 02 - Map Mutasi Kematian 2026"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-xs font-semibold text-slate-900 outline-none transition-all"
              required
            />
            <p className="text-[11px] text-slate-400">
              Membantu penelusuran cepat berkas asli apabila ada keperluan audit atau pembuktian hukum kelak.
            </p>
          </div>

          {/* Catatan Tambahan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Catatan Petugas (Opsional):</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan khusus, misal: Diterima oleh staf pelayanan dari Bpk. RT langsung."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-xs text-slate-900 outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Selesai & Finalkan Berkas Fisik</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

