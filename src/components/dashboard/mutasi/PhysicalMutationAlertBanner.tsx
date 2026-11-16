"use client";

import { useState, useEffect, useCallback } from "react";
import { getPhysicalMutations, PhysicalMutationItem, PhysicalMutationSummary } from "@/actions/mutasiFisik";
import { VerifyPhysicalMutationModal } from "./VerifyPhysicalMutationModal";
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  MessageCircle, 
  ArrowRight, 
  RefreshCw,
  Archive
} from "lucide-react";

export function PhysicalMutationAlertBanner({
  role,
  userRt,
  userRw,
  onMutationUpdated,
}: {
  role?: string;
  userRt?: string;
  userRw?: string;
  onMutationUpdated?: () => void;
}) {
  const [data, setData] = useState<PhysicalMutationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedItemForVerify, setSelectedItemForVerify] = useState<PhysicalMutationItem | null>(null);

  const isVillageStaff = [
    "ADMIN_DESA",
    "ADMIN_MASTER",
    "KASI_PELAYANAN",
    "KASI_PEMERINTAHAN",
    "KASI",
    "KAUR_TU",
    "SEKDES",
    "KADES",
    "OPERATOR_DESA",
  ].includes(role || "");

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await getPhysicalMutations("PENDING");
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!data || data.totalPending === 0) {
    return null;
  }

  // Role-customized title and subtitle
  let title = "Antrean Rekonsiliasi Berkas Fisik Kependudukan";
  let description = `Terdapat ${data.totalPending} laporan mutasi kependudukan yang belum diverifikasi berkas fisiknya.`;

  if (role === "RT") {
    title = `Tugas Penyerahan Berkas Fisik Mutasi (RT ${userRt || data.wilayahLabel})`;
    description = `Anda memiliki ${data.totalPending} laporan mutasi warga. Wajib segera menyerahkan berkas fisik (Surat Pengantar RT asli, Surat Kematian/Pindah, KTP lama) ke Meja Pelayanan Kantor Desa agar data resmi terverifikasi.`;
  } else if (role === "RW") {
    title = `Pengawasan Wilayah RW: ${data.totalPending} Berkas Mutasi Belum Diserahkan`;
    description = `Terdapat ${data.totalPending} laporan mutasi warga di wilayah RT binaan Anda yang berkas fisiknya belum sampai di kantor desa. Harap koordinasi dengan Ketua RT bersangkutan.`;
  } else if (role === "KADUS") {
    title = `Monitoring Kewilayahan Dusun: ${data.totalPending} Berkas Fisik Tertahan`;
    description = `Terdapat ${data.totalPending} mutasi kependudukan di Dusun Anda yang masih berstatus menunggu penyerahan berkas fisik ke kantor desa.`;
  } else if (isVillageStaff) {
    title = `Antrean Meja Pelayanan: ${data.totalPending} Berkas Fisik Menunggu Verifikasi`;
    description = `Laporan mutasi dari tingkat RT/RW telah masuk ke sistem. Silakan periksa dokumen asli yang dibawa pemohon/RT dan lakukan pencatatan Buku Induk Penduduk Desa.`;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border-2 border-amber-400/40 rounded-3xl p-5 shadow-sm backdrop-blur-md mb-6 relative overflow-hidden transition-all">
        {/* Subtle decorative background icon */}
        <div className="absolute -right-4 -bottom-4 text-amber-500/10 pointer-events-none">
          <ShieldAlert size={140} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <AlertTriangle size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-amber-950 tracking-tight">{title}</h4>
                <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  {data.totalPending} Tertunda
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed max-w-2xl">{description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-full shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <span>{expanded ? "Tutup Rincian" : "Lihat Daftar Warga"}</span>
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              title="Perbarui Data"
              className="p-2 bg-amber-100/80 hover:bg-amber-200 text-amber-800 rounded-full transition-colors"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Expandable list of pending items */}
        {expanded && (
          <div className="mt-5 pt-4 border-t border-amber-300/50 space-y-3 relative z-10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
              <span>Daftar Mutasi Yang Memerlukan Pembaharuan Berkas Fisik:</span>
              <span className="text-[10px] text-amber-700/80 normal-case">
                Meninggal: {data.deathCount} | Pindah: {data.moveCount} | Lahir: {data.birthCount} | Datang: {data.incomingCount}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {data.items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white/95 rounded-2xl p-4 border border-amber-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.type === "death"
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : item.type === "move"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-blue-100 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {item.typeLabel}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        RT {item.rt} / RW {item.rw}
                      </span>
                    </div>

                    <div className="font-extrabold text-xs text-slate-900 leading-tight">
                      {item.namaLengkap}
                    </div>

                    {item.nik && (
                      <div className="text-[11px] font-mono text-slate-500">NIK: {item.nik}</div>
                    )}

                    <div className="text-[11px] text-slate-600 line-clamp-2">{item.detail}</div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      <span>Kejadian: {item.tanggalKejadian}</span>
                    </span>

                    {/* Action button depending on role */}
                    {isVillageStaff ? (
                      <button
                        onClick={() => setSelectedItemForVerify(item)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-[11px] rounded-full shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} />
                        <span>Verifikasi Fisik</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                        <Clock size={11} />
                        <span>Menunggu Berkas ke Desa</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal for Village Staff */}
      {selectedItemForVerify && (
        <VerifyPhysicalMutationModal
          item={selectedItemForVerify}
          onClose={() => setSelectedItemForVerify(null)}
          onSuccess={() => {
            setSelectedItemForVerify(null);
            loadData();
            if (onMutationUpdated) onMutationUpdated();
          }}
        />
      )}
    </>
  );
}

