"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Send, 
  Check, 
  Printer, 
  RefreshCw, 
  Layers, 
  Building2, 
  Banknote,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Calendar,
  Archive,
  CheckSquare
} from "lucide-react";
import { UsulanItem } from "./DraftUsulanRw";
import { UndanganMuslingRwData } from "./UndanganMuslingRw";

interface RtSubmissionGroup {
  rtNo: string;
  namaKetuaRt?: string;
  sentAt?: string;
  tahun?: string;
  items: UsulanItem[];
  status?: "pending" | "approved" | "revised";
}

export function RekapanUsulanRwTab({
  userRw,
  userRole,
  userName,
  undanganData
}: {
  userRw?: string;
  userRole?: string;
  userName?: string;
  undanganData?: UndanganMuslingRwData;
}) {
  const activeRwRaw = (userRw || undanganData?.rwNo || "009").trim();
  const numRw = parseInt(activeRwRaw, 10) || 9;
  const paddedRw = String(numRw).padStart(3, "0");
  const rawRw = String(numRw);

  const [activeSubTab, setActiveSubTab] = useState<"rekapan" | "daftar_usulan">("rekapan");
  const [selectedYear, setSelectedYear] = useState<string>(undanganData?.tahun || "2026");

  const [pendingSubmissions, setPendingSubmissions] = useState<RtSubmissionGroup[]>([]);
  const [approvedArchive, setApprovedArchive] = useState<RtSubmissionGroup[]>([]);
  const [mounted, setMounted] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [revisionModalRt, setRevisionModalRt] = useState<string | null>(null);
  const [revisionNoteText, setRevisionNoteText] = useState<string>("");

  const loadSubmissions = () => {
    try {
      const pendingGroups: RtSubmissionGroup[] = [];

      for (let r = 1; r <= 30; r++) {
        const rtPadded = String(r).padStart(3, "0");
        const rtRaw = String(r);

        const sentKeys = [
          `musling_sent_usulan_rt_${rtPadded}_rw_${paddedRw}_v1`,
          `musling_sent_usulan_rt_${rtPadded}_rw_${rawRw}_v1`,
          `musling_sent_usulan_rt_${rtRaw}_rw_${paddedRw}_v1`,
          `musling_sent_usulan_rt_${rtRaw}_rw_${rawRw}_v1`
        ];

        for (const k of sentKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed.items) && parsed.items.length > 0) {
                const status = parsed.status || "pending";
                // Only load as pending if not yet approved and not yet revised
                if (status === "pending") {
                  pendingGroups.push({
                    rtNo: rtPadded,
                    namaKetuaRt: parsed.namaKetuaRt || `Ketua RT ${rtPadded}`,
                    sentAt: parsed.sentAt || "",
                    tahun: parsed.tahun || undanganData?.tahun || "2026",
                    items: parsed.items,
                    status: "pending"
                  });
                }
                break;
              }
            } catch (e) {}
          }
        }
      }

      setPendingSubmissions(pendingGroups);

      // Load Approved Archive for selectedYear
      loadArchiveForYear(selectedYear);
    } catch (err) {
      console.error("Error loading submissions for RW:", err);
    }
  };

  const loadArchiveForYear = (year: string) => {
    try {
      const archiveKeyPadded = `musling_approved_usulan_rw_${paddedRw}_year_${year}_v1`;
      const archiveKeyRaw = `musling_approved_usulan_rw_${rawRw}_year_${year}_v1`;

      const savedPadded = localStorage.getItem(archiveKeyPadded);
      const savedRaw = localStorage.getItem(archiveKeyRaw);
      const rawData = savedPadded || savedRaw;

      if (rawData) {
        const parsed: RtSubmissionGroup[] = JSON.parse(rawData);
        if (Array.isArray(parsed)) {
          setApprovedArchive(parsed);
          return;
        }
      }
      setApprovedArchive([]);
    } catch (err) {
      console.error("Error loading archive for year:", err);
      setApprovedArchive([]);
    }
  };

  useEffect(() => {
    loadSubmissions();
    setMounted(true);
  }, [userRw, undanganData?.rwNo]);

  useEffect(() => {
    loadArchiveForYear(selectedYear);
  }, [selectedYear]);

  // Open Revision Modal
  const handleOpenRevisionModal = (rtNo: string) => {
    setRevisionModalRt(rtNo);
    const revKey = `musling_revision_note_rt_${rtNo}_rw_${paddedRw}_v1`;
    const existing = localStorage.getItem(revKey);
    setRevisionNoteText(existing || "");
  };

  // Send Revision Note (returns to RT & removes from RW Rekapan)
  const handleSendRevisionNote = () => {
    if (!revisionModalRt) return;
    try {
      const rtNo = revisionModalRt;

      // 1. Save revision note for RT
      const revKeyPadded = `musling_revision_note_rt_${rtNo}_rw_${paddedRw}_v1`;
      const revKeyRaw = `musling_revision_note_rt_${rtNo}_rw_${rawRw}_v1`;
      localStorage.setItem(revKeyPadded, revisionNoteText);
      localStorage.setItem(revKeyRaw, revisionNoteText);

      // 2. Mark sent payload as revised
      const sentKeys = [
        `musling_sent_usulan_rt_${rtNo}_rw_${paddedRw}_v1`,
        `musling_sent_usulan_rt_${rtNo}_rw_${rawRw}_v1`
      ];

      sentKeys.forEach((k) => {
        const existing = localStorage.getItem(k);
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            parsed.status = "revised";
            localStorage.setItem(k, JSON.stringify(parsed));
          } catch (e) {}
        }
      });

      // 3. Reset RT sent status so RT can edit again
      const statusKeys = [
        `musling_sent_status_rt_${rtNo}_rw_${paddedRw}_v1`,
        `musling_sent_status_rt_${rtNo}_rw_${rawRw}_v1`
      ];
      statusKeys.forEach((sk) => {
        localStorage.setItem(sk, JSON.stringify({ isSent: false, revisedAt: new Date().toISOString() }));
      });

      setSuccessToast(`⚠️ Catatan Revisi Usulan RT ${rtNo} Berhasil Dikirim! Data dikembalikan ke RT ${rtNo}.`);
      setRevisionModalRt(null);
      setRevisionNoteText("");
      setTimeout(() => setSuccessToast(null), 6000);
      loadSubmissions();
    } catch (err) {
      console.error("Error sending revision note:", err);
    }
  };

  // Approve RT submission: add to RW Draft Usulan & Archive, remove from Rekapan
  const handleVerifyRt = (group: RtSubmissionGroup) => {
    try {
      const rtNo = group.rtNo;
      const targetYear = group.tahun || selectedYear || "2026";

      // 1. Mark sent usulan as approved
      const sentKeys = [
        `musling_sent_usulan_rt_${rtNo}_rw_${paddedRw}_v1`,
        `musling_sent_usulan_rt_${rtNo}_rw_${rawRw}_v1`
      ];

      sentKeys.forEach((k) => {
        const existing = localStorage.getItem(k);
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            parsed.status = "approved";
            localStorage.setItem(k, JSON.stringify(parsed));
          } catch (e) {}
        }
      });

      // 2. Clear revision notes
      localStorage.removeItem(`musling_revision_note_rt_${rtNo}_rw_${paddedRw}_v1`);
      localStorage.removeItem(`musling_revision_note_rt_${rtNo}_rw_${rawRw}_v1`);

      // 3. Update RW Draft Usulan (musling_draft_usulan_items_rw_${paddedRw}_v1)
      const rwItemsKeyPadded = `musling_draft_usulan_items_rw_${paddedRw}_v1`;
      const rwItemsKeyRaw = `musling_draft_usulan_items_rw_${rawRw}_v1`;

      let existingRwItems: UsulanItem[] = [];
      const currentRwItemsRaw = localStorage.getItem(rwItemsKeyPadded) || localStorage.getItem(rwItemsKeyRaw);
      if (currentRwItemsRaw) {
        try {
          existingRwItems = JSON.parse(currentRwItemsRaw);
        } catch (e) {}
      }

      const seenIds = new Set(existingRwItems.map((i) => i.id));
      group.items.forEach((item) => {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          existingRwItems.push(item);
        }
      });

      localStorage.setItem(rwItemsKeyPadded, JSON.stringify(existingRwItems));
      localStorage.setItem(rwItemsKeyRaw, JSON.stringify(existingRwItems));

      // 4. Update Archive DAFTAR USULAN by year
      const archiveKeyPadded = `musling_approved_usulan_rw_${paddedRw}_year_${targetYear}_v1`;
      const archiveKeyRaw = `musling_approved_usulan_rw_${rawRw}_year_${targetYear}_v1`;

      let existingArchive: RtSubmissionGroup[] = [];
      const currentArchiveRaw = localStorage.getItem(archiveKeyPadded) || localStorage.getItem(archiveKeyRaw);
      if (currentArchiveRaw) {
        try {
          existingArchive = JSON.parse(currentArchiveRaw);
        } catch (e) {}
      }

      // Remove previous entry for this RT if exists, then add updated
      existingArchive = existingArchive.filter((g) => g.rtNo !== rtNo);
      existingArchive.push({
        ...group,
        status: "approved"
      });

      localStorage.setItem(archiveKeyPadded, JSON.stringify(existingArchive));
      localStorage.setItem(archiveKeyRaw, JSON.stringify(existingArchive));

      setSuccessToast(`✅ Usulan RT ${rtNo} Berhasil Disetujui! Otomatis masuk ke Draft Usulan RW & Daftar Usulan (Arsip ${targetYear}).`);
      setTimeout(() => setSuccessToast(null), 6000);
      loadSubmissions();
    } catch (err) {
      console.error("Error approving RT submission:", err);
    }
  };

  // Approve all pending RT submissions
  const handleVerifyAll = () => {
    pendingSubmissions.forEach((group) => {
      handleVerifyRt(group);
    });
    setSuccessToast(`✅ Seluruh Usulan RT Berhasil Disetujui & Masuk ke Draft RW serta Daftar Usulan!`);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  const totalPendingUsulan = pendingSubmissions.reduce((acc, g) => acc + g.items.length, 0);
  const totalPendingBiaya = pendingSubmissions.reduce((acc, g) => {
    return acc + g.items.reduce((sum, item) => sum + (Number(item.besarnyaBiaya) || 0), 0);
  }, 0);

  const totalArchivedUsulan = approvedArchive.reduce((acc, g) => acc + g.items.length, 0);
  const totalArchivedBiaya = approvedArchive.reduce((acc, g) => {
    return acc + g.items.reduce((sum, item) => sum + (Number(item.besarnyaBiaya) || 0), 0);
  }, 0);

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* SUCCESS TOAST ALERT */}
      {successToast && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg no-print animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-black text-sm">{successToast}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Hasil usulan disetujui dapat dilihat di menu &quot;4. DRAFT USULAN RW&quot; dan Arsip &quot;DAFTAR USULAN&quot;.
              </p>
            </div>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded-lg hover:bg-emerald-100">
            ✕
          </button>
        </div>
      )}

      {/* TOP NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 no-print overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("rekapan")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "rekapan"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileText size={16} />
          <span>VERIFIKASI USULAN MASUK</span>
          {pendingSubmissions.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold">
              {pendingSubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("daftar_usulan")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "daftar_usulan"
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Archive size={16} />
          <span>DAFTAR USULAN & ARSIP (TAHUN KE TAHUN)</span>
          {approvedArchive.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
              {approvedArchive.length} RT
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB 1: REKAPAN VERIFIKASI USULAN MASUK */}
      {activeSubTab === "rekapan" && (
        <div className="space-y-6">
          {/* HEADER BAR */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock size={12} className="text-amber-600" />
                  <span>VERIFIKASI USULAN RT (RW {paddedRw})</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={11} className="text-emerald-600" />
                  <span>Realtime Sync</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Rekapan Usulan Pembangunan Masuk dari RT
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Setujui usulan untuk langsung diteruskan ke Draft RW & Daftar Usulan, atau berikan catatan Revisi.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={loadSubmissions}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer min-h-[44px]"
              >
                <RefreshCw size={15} />
                <span>Muat Ulang Data</span>
              </button>

              {pendingSubmissions.length > 0 && (
                <button
                  onClick={handleVerifyAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
                >
                  <CheckCircle2 size={16} />
                  <span>Setujui Semua Usulan RT</span>
                </button>
              )}
            </div>
          </div>

          {/* METRIC STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Total RT Menunggu</span>
                <Building2 size={16} className="text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{pendingSubmissions.length} RT</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Wilayah RW {paddedRw}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Item Usulan</span>
                <Layers size={16} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalPendingUsulan} Item</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Usulan Menunggu Verifikasi</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Estimasi Total Biaya</span>
                <Banknote size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 truncate">
                Rp {totalPendingBiaya.toLocaleString("id-ID")}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Akumulasi Usulan Menunggu Verifikasi RW {paddedRw}</p>
            </div>
          </div>

          {/* LIST OF PENDING SUBMISSIONS */}
          {pendingSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm no-print space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckSquare size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Tidak Ada Usulan RT Menunggu Verifikasi</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Seluruh usulan RT di RW {paddedRw} telah diverifikasi atau belum ada kiriman usulan baru dari RT. Anda dapat melihat hasil usulan yang disetujui di tab &quot;DAFTAR USULAN & ARSIP&quot;.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingSubmissions.map((group) => {
                const groupBiaya = group.items.reduce((s, i) => s + (Number(i.besarnyaBiaya) || 0), 0);

                return (
                  <div
                    key={group.rtNo}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-slate-300"
                  >
                    {/* RT CARD HEADER */}
                    <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                          RT {group.rtNo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 text-base">
                              Usulan dari RT {group.rtNo} / RW {paddedRw}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock size={12} className="text-amber-600" />
                              Menunggu Verifikasi RW
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Ketua RT: <strong className="text-slate-700">{group.namaKetuaRt}</strong>
                            {group.sentAt && (
                              <span className="ml-3 text-slate-400">
                                Waktu Kirim: {new Date(group.sentAt).toLocaleString("id-ID")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* ACTION BUTTONS: SETUJUI & REVISI */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyRt(group)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Setujui</span>
                        </button>

                        <button
                          onClick={() => handleOpenRevisionModal(group.rtNo)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                        >
                          <Edit3 size={14} />
                          <span>Revisi</span>
                        </button>
                      </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100/60 text-slate-800 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4 text-center w-12">No</th>
                            <th className="py-3 px-4">Jenis Kegiatan Usulan</th>
                            <th className="py-3 px-4 text-center w-32">Volume</th>
                            <th className="py-3 px-4 text-center w-28">Sifat</th>
                            <th className="py-3 px-4 text-right w-44">Besarnya Biaya (Rp)</th>
                            <th className="py-3 px-4">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.items.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors font-medium">
                              <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{item.jenisKegiatan}</td>
                              <td className="py-3 px-4 text-center font-semibold">{item.volume || "-"}</td>
                              <td className="py-3 px-4 text-center">
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
                              <td className="py-3 px-4 text-right font-black text-slate-900">
                                {item.besarnyaBiaya ? `Rp ${Number(item.besarnyaBiaya).toLocaleString("id-ID")}` : "-"}
                              </td>
                              <td className="py-3 px-4 text-slate-600">{item.keterangan || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                          <tr>
                            <td colSpan={4} className="py-2.5 px-4 text-right uppercase text-[10px] text-slate-500 tracking-wider">
                              Subtotal Biaya Usulan RT {group.rtNo}:
                            </td>
                            <td className="py-2.5 px-4 text-right font-black text-emerald-700 text-sm">
                              Rp {groupBiaya.toLocaleString("id-ID")}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: DAFTAR USULAN & ARSIP (TAHUN KE TAHUN) */}
      {activeSubTab === "daftar_usulan" && (
        <div className="space-y-6">
          {/* ARSIP HEADER WITH YEAR DROPDOWN */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Archive size={12} className="text-emerald-600" />
                  <span>ARSIP DAFTAR USULAN (RW {paddedRw})</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  <span>Terverifikasi</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Daftar Usulan Terverifikasi (Tahun ke Tahun)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Arsip Resmi Rekapan Usulan Pembangunan yang Telah Disetujui oleh RW {paddedRw}
              </p>
            </div>

            {/* DROPDOWN TAHUN KE TAHUN */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <Calendar size={16} className="text-slate-500 ml-1" />
              <label className="text-xs font-black text-slate-700">Pilih Tahun Usulan:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-black bg-white focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
              >
                <option value="2026">Tahun 2026</option>
                <option value="2025">Tahun 2025</option>
                <option value="2024">Tahun 2024</option>
                <option value="2023">Tahun 2023</option>
              </select>
            </div>
          </div>

          {/* ARSIP METRIC STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Total RT Disetujui</span>
                <Building2 size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{approvedArchive.length} RT</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Tahun {selectedYear}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Item Usulan</span>
                <Layers size={16} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalArchivedUsulan} Item</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Disetujui RW {paddedRw}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Biaya Disetujui</span>
                <Banknote size={16} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 truncate">
                Rp {totalArchivedBiaya.toLocaleString("id-ID")}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Akumulasi Usulan Disetujui Tahun {selectedYear}</p>
            </div>
          </div>

          {/* ARCHIVED GROUPS */}
          {approvedArchive.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm no-print space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Archive size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Belum Ada Arsip Usulan Disetujui pada Tahun {selectedYear}</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Saat Anda menekan tombol &quot;Setujui&quot; pada usulan RT di tab Verifikasi, usulan tersebut akan otomatis tersimpan di arsip tahun {selectedYear} ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {approvedArchive.map((group) => {
                const groupBiaya = group.items.reduce((s, i) => s + (Number(i.besarnyaBiaya) || 0), 0);

                return (
                  <div
                    key={group.rtNo}
                    className="bg-white rounded-2xl border border-emerald-300 ring-1 ring-emerald-300/40 shadow-sm overflow-hidden"
                  >
                    <div className="p-5 bg-emerald-50/50 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shrink-0">
                          RT {group.rtNo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-900 text-base">
                              Daftar Usulan Terverifikasi — RT {group.rtNo} / RW {paddedRw}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              Disetujui RW (Tahun {selectedYear})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Ketua RT: <strong className="text-slate-700">{group.namaKetuaRt}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-100/60 text-slate-800 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4 text-center w-12">No</th>
                            <th className="py-3 px-4">Jenis Kegiatan Usulan</th>
                            <th className="py-3 px-4 text-center w-32">Volume</th>
                            <th className="py-3 px-4 text-center w-28">Sifat</th>
                            <th className="py-3 px-4 text-right w-44">Besarnya Biaya (Rp)</th>
                            <th className="py-3 px-4">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.items.map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors font-medium">
                              <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{item.jenisKegiatan}</td>
                              <td className="py-3 px-4 text-center font-semibold">{item.volume || "-"}</td>
                              <td className="py-3 px-4 text-center">
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
                              <td className="py-3 px-4 text-right font-black text-slate-900">
                                {item.besarnyaBiaya ? `Rp ${Number(item.besarnyaBiaya).toLocaleString("id-ID")}` : "-"}
                              </td>
                              <td className="py-3 px-4 text-slate-600">{item.keterangan || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-emerald-50/30 font-bold border-t border-slate-200">
                          <tr>
                            <td colSpan={4} className="py-2.5 px-4 text-right uppercase text-[10px] text-slate-500 tracking-wider">
                              Subtotal Biaya Usulan RT {group.rtNo}:
                            </td>
                            <td className="py-2.5 px-4 text-right font-black text-emerald-700 text-sm">
                              Rp {groupBiaya.toLocaleString("id-ID")}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* REVISION NOTE MODAL */}
      {revisionModalRt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  RT {revisionModalRt}
                </div>
                <h3 className="font-black text-slate-800 text-base">Catatan Revisi untuk RT {revisionModalRt}</h3>
              </div>
              <button 
                onClick={() => setRevisionModalRt(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Tuliskan instruksi atau catatan perbaikan usulan yang perlu disesuaikan oleh Pengurus RT {revisionModalRt} sebelum dikirim ulang.
            </p>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                Isi Catatan Revisi RW:
              </label>
              <textarea
                value={revisionNoteText}
                onChange={(e) => setRevisionNoteText(e.target.value)}
                placeholder="Contoh: Mohon kurangi anggaran pengaspalan jalan atau cantumkan nomor RT pengusul secara lengkap..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-medium min-h-[100px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRevisionModalRt(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSendRevisionNote}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Send size={15} />
                <span>Kirim Catatan Revisi ke RT {revisionModalRt}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
