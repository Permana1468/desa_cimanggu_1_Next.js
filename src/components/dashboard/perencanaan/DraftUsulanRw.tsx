"use client";

import React, { useState, useEffect } from "react";
import { SafePrintPortal } from "./SafePrintPortal";
import { 
  ArrowLeft, 
  Printer, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  RefreshCw, 
  Sparkles, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  Send, 
  AlertCircle,
  Archive,
  Calendar,
  FolderArchive,
  Save,
  Banknote
} from "lucide-react";
import { UndanganMuslingRwData } from "./UndanganMuslingRw";

export interface UsulanItem {
  id: string;
  jenisKegiatan: string;
  volume: string;
  sifatKegiatan: "BARU" | "LAMA" | "REHAB";
  besarnyaBiaya: number;
  keterangan: string;
}

export interface DraftUsulanRwData {
  kpName: string; // e.g. "Ciaruteun"
  rtNo: string; // e.g. "004"
  rwNo: string; // e.g. "002"
  tanggalUsulan: string; // e.g. "16 Agustus 2026"
  tahunUsulan: string; // e.g. "2026"
  namaKetuaRt: string; // e.g. "M. HARIS"
  namaKetuaRw: string; // e.g. "SAEPULOH"
}

interface DraftUsulanRwProps {
  undanganData: UndanganMuslingRwData;
  userRt?: string;
  userRw?: string;
  userRole?: string;
  userName?: string;
  onBack?: () => void;
}

const defaultUsulanList: UsulanItem[] = [
  {
    id: "usulan-1",
    jenisKegiatan: "Pengaspalan Jalan Lingkungan Kp. Ciaruteun RT 004 / RW 002",
    volume: "400 Meter",
    sifatKegiatan: "BARU",
    besarnyaBiaya: 120000000,
    keterangan: "Prioritas 1 RW 002"
  },
  {
    id: "usulan-2",
    jenisKegiatan: "Rehabilitasi Drainase & Saluran Air Posyandu Mawar",
    volume: "150 Meter",
    sifatKegiatan: "REHAB",
    besarnyaBiaya: 35000000,
    keterangan: "Prioritas 2 RW 002"
  },
  {
    id: "usulan-3",
    jenisKegiatan: "Pemasangan Penerangan Jalan Umum (PJU) Swadaya",
    volume: "10 Titik",
    sifatKegiatan: "LAMA",
    besarnyaBiaya: 15000000,
    keterangan: "Usulan Non-Fisik / Lampu"
  }
];

export function DraftUsulanRw({ 
  undanganData, 
  userRt, 
  userRw, 
  userRole, 
  userName, 
  onBack 
}: DraftUsulanRwProps) {
  const isRt = userRole === "RT";
  const activeRt = (userRt || "001").trim();
  const activeRw = (userRw || undanganData?.rwNo || "002").trim();
  const numRw = parseInt(activeRw, 10) || 9;
  const paddedRw = String(numRw).padStart(3, "0");
  const rawRw = String(numRw);

  const [isSent, setIsSent] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState<string | null>(null);

  // Arsip Musrenbang States
  const [selectedArchiveYear, setSelectedArchiveYear] = useState<string>("active");
  const [archiveSuccessMsg, setArchiveSuccessMsg] = useState<string | null>(null);
  const [archivedData, setArchivedData] = useState<{ headerData: DraftUsulanRwData; items: UsulanItem[] } | null>(null);

  // Storage keys depending on whether current user is RT or RW
  const headerStorageKey = isRt 
    ? `musling_draft_usulan_header_rt_${activeRt}_rw_${activeRw}_v1`
    : `musling_draft_usulan_header_rw_${activeRw}_v1`;

  const itemsStorageKey = isRt
    ? `musling_draft_usulan_items_rt_${activeRt}_rw_${activeRw}_v1`
    : `musling_draft_usulan_items_rw_${activeRw}_v1`;

  const [usulanList, setUsulanList] = useState<UsulanItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const [headerData, setHeaderData] = useState<DraftUsulanRwData>({
    kpName: "Ciaruteun",
    rtNo: isRt ? activeRt : "004",
    rwNo: activeRw,
    tanggalUsulan: undanganData?.tanggalAcara || "16 AGUSTUS 2026",
    tahunUsulan: undanganData?.tahun || "2026",
    namaKetuaRt: userName || "M. HARIS",
    namaKetuaRw: undanganData?.namaKetuaRw || "SAEPULOH"
  });

  // Form state untuk tambah item usulan baru
  const [newJenisKegiatan, setNewJenisKegiatan] = useState("");
  const [newVolume, setNewVolume] = useState("1 Paket");
  const [newSifatKegiatan, setNewSifatKegiatan] = useState<"BARU" | "LAMA" | "REHAB">("BARU");
  const [newBesarnyaBiaya, setNewBesarnyaBiaya] = useState<number>(0);
  const [newKeterangan, setNewKeterangan] = useState("");

  // Edit item state
  const [editingItem, setEditingItem] = useState<UsulanItem | null>(null);

  // Sync headerData whenever undanganData changes (real-time propagation)
  useEffect(() => {
    if (undanganData) {
      setHeaderData((prev) => ({
        ...prev,
        rwNo: undanganData.rwNo || prev.rwNo,
        namaKetuaRw: undanganData.namaKetuaRw || prev.namaKetuaRw,
        tanggalUsulan: undanganData.tanggalAcara || prev.tanggalUsulan,
        tahunUsulan: undanganData.tahun || prev.tahunUsulan,
      }));
    }
  }, [undanganData?.rwNo, undanganData?.namaKetuaRw, undanganData?.tanggalAcara, undanganData?.tahun]);

  // Handle RT sending draft usulan directly to RW
  const handleSendToRw = () => {
    try {
      const payload = {
        rtNo: activeRt,
        rwNo: activeRw,
        namaKetuaRt: headerData.namaKetuaRt,
        sentAt: new Date().toISOString(),
        tahun: headerData.tahunUsulan || "2026",
        items: usulanList,
        status: "pending"
      };

      localStorage.setItem(`musling_sent_usulan_rt_${activeRt}_rw_${paddedRw}_v1`, JSON.stringify(payload));
      localStorage.setItem(`musling_sent_usulan_rt_${activeRt}_rw_${rawRw}_v1`, JSON.stringify(payload));

      const statusKey = `musling_sent_status_rt_${activeRt}_rw_${activeRw}_v1`;
      localStorage.setItem(statusKey, JSON.stringify({ isSent: true, sentAt: new Date().toISOString() }));

      // Clear revision note when re-submitted
      localStorage.removeItem(`musling_revision_note_rt_${activeRt}_rw_${paddedRw}_v1`);
      localStorage.removeItem(`musling_revision_note_rt_${activeRt}_rw_${rawRw}_v1`);
      setRevisionNote(null);

      setIsSent(true);
      setSendSuccessMsg(`✅ Usulan RT ${activeRt} Berhasil Dikirim ke Ketua RW ${activeRw}!`);
      setTimeout(() => setSendSuccessMsg(null), 7000);
    } catch (err) {
      console.error("Error sending usulan to RW:", err);
    }
  };

  // Auto-load & Auto-save via localStorage
  useEffect(() => {
    try {
      if (isRt) {
        // --- RT MODE ---
        const revKey = `musling_revision_note_rt_${activeRt}_rw_${paddedRw}_v1`;
        const revKeyAlt = `musling_revision_note_rt_${activeRt}_rw_${rawRw}_v1`;
        const savedRevNote = localStorage.getItem(revKey) || localStorage.getItem(revKeyAlt);
        if (savedRevNote) {
          setRevisionNote(savedRevNote);
        }

        const statusKey = `musling_sent_status_rt_${activeRt}_rw_${activeRw}_v1`;
        const savedStatus = localStorage.getItem(statusKey);
        if (savedStatus) {
          try {
            const parsed = JSON.parse(savedStatus);
            if (parsed.isSent) setIsSent(true);
          } catch (e) {}
        }

        const savedHeader = localStorage.getItem(headerStorageKey);
        if (savedHeader) {
          const parsed = JSON.parse(savedHeader);
          setHeaderData((prev) => ({
            ...prev,
            ...parsed,
            rtNo: activeRt,
            rwNo: activeRw,
            namaKetuaRt: userName || parsed.namaKetuaRt || prev.namaKetuaRt
          }));
        } else {
          setHeaderData((prev) => ({
            ...prev,
            rtNo: activeRt,
            rwNo: activeRw,
            namaKetuaRt: userName || prev.namaKetuaRt
          }));
        }

        const savedItems = localStorage.getItem(itemsStorageKey);
        if (savedItems) {
          setUsulanList(JSON.parse(savedItems));
        } else {
          setUsulanList(
            defaultUsulanList.map(u => ({
              ...u,
              jenisKegiatan: u.jenisKegiatan.replace(/RT\s*004/g, `RT ${activeRt}`).replace(/RW\s*002/g, `RW ${activeRw}`),
              keterangan: u.keterangan.replace(/RW\s*002/g, `RW ${activeRw}`)
            }))
          );
        }
      } else {
        // --- RW MODE (Only load items approved by RW or added by RW) ---
        const savedHeader = localStorage.getItem(headerStorageKey);
        if (savedHeader) {
          const parsed = JSON.parse(savedHeader);
          setHeaderData((prev) => ({
            ...prev,
            ...parsed,
            rwNo: activeRw,
            namaKetuaRw: undanganData?.namaKetuaRw || parsed.namaKetuaRw || prev.namaKetuaRw
          }));
        }

        const savedRwItems = localStorage.getItem(itemsStorageKey);
        if (savedRwItems) {
          try {
            const parsedRw: UsulanItem[] = JSON.parse(savedRwItems);
            setUsulanList(parsedRw);
          } catch (err) {
            console.error("Error loading RW approved items:", err);
            setUsulanList([]);
          }
        } else {
          setUsulanList([]);
        }
      }
    } catch (err) {
      console.error("Error loading localStorage for Draft Usulan:", err);
    }
    setMounted(true);
  }, [isRt, activeRt, activeRw, headerStorageKey, itemsStorageKey, userName, paddedRw, rawRw, undanganData?.namaKetuaRw]);

  // Load Archive data when selectedArchiveYear changes
  useEffect(() => {
    if (!isRt && selectedArchiveYear !== "active") {
      const archiveKeyPadded = `musling_archive_musrenbang_rw_${paddedRw}_year_${selectedArchiveYear}_v1`;
      const archiveKeyRaw = `musling_archive_musrenbang_rw_${rawRw}_year_${selectedArchiveYear}_v1`;

      const savedArchive = localStorage.getItem(archiveKeyPadded) || localStorage.getItem(archiveKeyRaw);
      if (savedArchive) {
        try {
          const parsed = JSON.parse(savedArchive);
          setArchivedData({
            headerData: parsed.headerData || headerData,
            items: parsed.items || []
          });
          return;
        } catch (e) {}
      }

      // Fallback: check approved archive from Rekapan tab for selectedArchiveYear
      const approvedKeyPadded = `musling_approved_usulan_rw_${paddedRw}_year_${selectedArchiveYear}_v1`;
      const approvedKeyRaw = `musling_approved_usulan_rw_${rawRw}_year_${selectedArchiveYear}_v1`;
      const rawApproved = localStorage.getItem(approvedKeyPadded) || localStorage.getItem(approvedKeyRaw);
      if (rawApproved) {
        try {
          const parsedGroups = JSON.parse(rawApproved);
          if (Array.isArray(parsedGroups)) {
            const compiled: UsulanItem[] = [];
            parsedGroups.forEach((g: any) => {
              if (Array.isArray(g.items)) compiled.push(...g.items);
            });
            setArchivedData({
              headerData: { ...headerData, tahunUsulan: selectedArchiveYear },
              items: compiled
            });
            return;
          }
        } catch (e) {}
      }

      setArchivedData({
        headerData: { ...headerData, tahunUsulan: selectedArchiveYear },
        items: []
      });
    } else {
      setArchivedData(null);
    }
  }, [selectedArchiveYear, isRt, paddedRw, rawRw, headerData]);

  useEffect(() => {
    if (mounted && selectedArchiveYear === "active") {
      try {
        localStorage.setItem(headerStorageKey, JSON.stringify(headerData));
      } catch (err) {
        console.error("Error saving headerData to localStorage:", err);
      }
    }
  }, [headerData, headerStorageKey, mounted, selectedArchiveYear]);

  useEffect(() => {
    if (mounted && selectedArchiveYear === "active") {
      try {
        localStorage.setItem(itemsStorageKey, JSON.stringify(usulanList));
      } catch (err) {
        console.error("Error saving usulanList to localStorage:", err);
      }
    }
  }, [usulanList, itemsStorageKey, mounted, selectedArchiveYear]);

  // Handle Save Active Draft to Archive Musrenbang
  const handleSaveToArchive = () => {
    if (usulanList.length === 0) {
      alert("Draft Usulan RW masih kosong. Tidak ada usulan untuk disimpan ke Arsip Musrenbang.");
      return;
    }

    const targetYear = headerData.tahunUsulan || "2026";
    const archiveKeyPadded = `musling_archive_musrenbang_rw_${paddedRw}_year_${targetYear}_v1`;
    const archiveKeyRaw = `musling_archive_musrenbang_rw_${rawRw}_year_${targetYear}_v1`;

    const payload = {
      savedAt: new Date().toISOString(),
      headerData: { ...headerData },
      items: [...usulanList]
    };

    localStorage.setItem(archiveKeyPadded, JSON.stringify(payload));
    localStorage.setItem(archiveKeyRaw, JSON.stringify(payload));

    // Sync with approved archive list for RekapanUsulanRwTab
    const approvedKeyPadded = `musling_approved_usulan_rw_${paddedRw}_year_${targetYear}_v1`;
    const approvedKeyRaw = `musling_approved_usulan_rw_${rawRw}_year_${targetYear}_v1`;

    let existingApprovedGroups: any[] = [];
    const currentApprovedRaw = localStorage.getItem(approvedKeyPadded) || localStorage.getItem(approvedKeyRaw);
    if (currentApprovedRaw) {
      try {
        const parsed = JSON.parse(currentApprovedRaw);
        if (Array.isArray(parsed)) existingApprovedGroups = parsed;
      } catch (e) {}
    }

    const rwGroup = {
      rtNo: `RW ${activeRw}`,
      namaKetuaRt: headerData.namaKetuaRw || `Ketua RW ${activeRw}`,
      sentAt: new Date().toISOString(),
      tahun: targetYear,
      items: [...usulanList],
      status: "approved"
    };

    const updatedApproved = [
      ...existingApprovedGroups.filter((g: any) => g.rtNo !== `RW ${activeRw}`),
      rwGroup
    ];
    localStorage.setItem(approvedKeyPadded, JSON.stringify(updatedApproved));
    localStorage.setItem(approvedKeyRaw, JSON.stringify(updatedApproved));

    // Clear active draft in working state & localStorage
    setUsulanList([]);
    localStorage.setItem(itemsStorageKey, JSON.stringify([]));

    setArchiveSuccessMsg(`✅ Draft Usulan RW ${activeRw} Berhasil Disimpan ke Arsip Musrenbang Tahun ${targetYear}! Draft usulan telah dikosongkan kembali.`);
    setTimeout(() => setArchiveSuccessMsg(null), 7000);
  };

  const handleAddUsulan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJenisKegiatan) return;
    const newItem: UsulanItem = {
      id: `usulan-${Date.now()}`,
      jenisKegiatan: newJenisKegiatan,
      volume: newVolume || "1 Paket",
      sifatKegiatan: newSifatKegiatan,
      besarnyaBiaya: Number(newBesarnyaBiaya) || 0,
      keterangan: newKeterangan || "-"
    };
    setUsulanList([...usulanList, newItem]);
    setNewJenisKegiatan("");
    setNewVolume("1 Paket");
    setNewBesarnyaBiaya(0);
    setNewKeterangan("");
  };

  const handleDeleteUsulan = (id: string) => {
    setUsulanList(usulanList.filter((u) => u.id !== id));
  };

  const handleStartEdit = (item: UsulanItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.jenisKegiatan) return;

    setUsulanList((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    setEditingItem(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Derive active header and list based on mode & selected archive year
  const currentHeaderData = (!isRt && selectedArchiveYear !== "active" && archivedData)
    ? archivedData.headerData
    : headerData;

  const currentUsulanList = (!isRt && selectedArchiveYear !== "active" && archivedData)
    ? archivedData.items
    : usulanList;

  const totalBiayaCalculated = currentUsulanList.reduce((acc, item) => acc + (Number(item.besarnyaBiaya) || 0), 0);

  // Pre-fill minimal 10 baris untuk tampilan cetak dokumen F4 Landscape yang rapi
  const displayRows = [...currentUsulanList];
  while (displayRows.length < 10) {
    displayRows.push({
      id: `blank-${displayRows.length}`,
      jenisKegiatan: "",
      volume: "",
      sifatKegiatan: "BARU",
      besarnyaBiaya: 0,
      keterangan: ""
    });
  }

  const formatCurrency = (val: number) => {
    if (val === undefined || val === null || val === 0) return "-";
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const renderDraftUsulanContent = (isPortal = false) => (
    <div
      id={isPortal ? "draft-usulan-print-portal" : "draft-usulan-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative notranslate"
      translate="no"
      style={{
        width: isPortal ? "330.2mm" : "100%",
        maxWidth: "330.2mm",
        minHeight: "215.9mm",
        padding: "12mm 15mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "11pt",
        lineHeight: "1.4"
      }}
    >
      {/* 1. JUDUL & KP / RT / RW (PERSIS GAMBAR) */}
      <div className="text-center font-bold text-[13pt] mb-6 uppercase tracking-wide notranslate" translate="no">
        <div>BENTUK USULAN PERENCANAAN PEMBANGUNAN FISIK DAN NON FISIK</div>
        <div className="mt-2 text-[12pt] flex items-center justify-center gap-3 sm:gap-5 flex-wrap font-bold">
          <div className="inline-flex items-center gap-1">
            <span>KP.</span>
            <span key={`kp-${currentHeaderData.kpName}`} className="underline decoration-dotted px-1 font-bold">
              {currentHeaderData.kpName || "...................................."}
            </span>
          </div>
          {isRt && (
            <div className="inline-flex items-center gap-1">
              <span>RT.</span>
              <span key={`rt-${currentHeaderData.rtNo}`} className="underline decoration-dotted px-1 font-bold">
                {currentHeaderData.rtNo || ".........."}
              </span>
            </div>
          )}
          <div className="inline-flex items-center gap-1">
            <span>RW.</span>
            <span key={`rw-${currentHeaderData.rwNo}`} className="underline decoration-dotted px-1 font-bold">
              {currentHeaderData.rwNo || ".........."}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TABEL DRAFT USULAN (PERSIS GAMBAR FORMAT BORDER BLACK) */}
      <table className="w-full border-collapse border border-black text-[10pt] table-fixed mb-6 notranslate" translate="no">
        <thead>
          <tr className="bg-slate-100 font-bold text-center border-b border-black">
            <th className="border border-black p-1.5 w-[35px]" rowSpan={2}>
              <span>NO</span>
            </th>
            <th className="border border-black p-1.5 text-center" rowSpan={2}>JENIS KEGIATAN</th>
            <th className="border border-black p-1.5 w-[110px]" rowSpan={2}>VOLUME</th>
            <th className="border border-black p-1 text-center" colSpan={3}>SIFAT KEGIATAN</th>
            <th className="border border-black p-1.5 w-[150px]" rowSpan={2}>BESARNYA BIAYA</th>
            <th className="border border-black p-1.5 w-[150px]" rowSpan={2}>KETERANGAN</th>
          </tr>
          <tr className="bg-slate-100 font-bold text-center border-b border-black">
            <th className="border border-black p-1 w-[50px]">BARU</th>
            <th className="border border-black p-1 w-[50px]">LAMA</th>
            <th className="border border-black p-1 w-[50px]">REHAB</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, idx) => (
            <tr key={row.id} className="h-[32px]">
              <td className="border border-black p-1 text-center font-medium">
                {row.jenisKegiatan ? idx + 1 : ""}
              </td>
              <td className="border border-black p-1 font-semibold px-2">
                {row.jenisKegiatan}
              </td>
              <td className="border border-black p-1 text-center font-medium">
                {row.volume}
              </td>
              <td className="border border-black p-1 text-center font-bold">
                {row.jenisKegiatan && row.sifatKegiatan === "BARU" ? "✓" : ""}
              </td>
              <td className="border border-black p-1 text-center font-bold">
                {row.jenisKegiatan && row.sifatKegiatan === "LAMA" ? "✓" : ""}
              </td>
              <td className="border border-black p-1 text-center font-bold">
                {row.jenisKegiatan && row.sifatKegiatan === "REHAB" ? "✓" : ""}
              </td>
              <td className="border border-black p-1 text-right font-mono font-bold pr-2">
                {row.jenisKegiatan ? formatCurrency(row.besarnyaBiaya) : ""}
              </td>
              <td className="border border-black p-1 px-2 text-slate-800">
                {row.keterangan}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-bold border-t-2 border-black h-[34px]">
            <td colSpan={6} className="border border-black p-1.5 text-right font-bold tracking-wider text-[10pt]">
              JUMLAH TOTAL BIAYA:
            </td>
            <td className="border border-black p-1.5 text-right font-mono font-bold pr-2 text-[10pt]">
              {totalBiayaCalculated > 0 ? `Rp ${totalBiayaCalculated.toLocaleString("id-ID")}` : "-"}
            </td>
            <td className="border border-black p-1.5"></td>
          </tr>
        </tfoot>
      </table>

      {/* 3 & 4 & 5. TANDA TANGAN */}
      {isRt ? (
        <div className="grid grid-cols-2 text-[11pt] mt-8 notranslate" translate="no">
          {/* Kiri: Mengetahui Ketua RW */}
          <div className="text-center w-[250px] mx-auto">
            <div className="notranslate" translate="no">
              <span className="notranslate" translate="no" data-nosnippet="true">
                Meng{"\u200B"}etahu{"\u200B"}i,
              </span>
            </div>
            <div key={`rw-ttd-${currentHeaderData.rwNo}`}>
              Ketua RW {currentHeaderData.rwNo || ".........."}
            </div>
            <div className="h-20"></div>
            <div
              key={`rw-nama-${currentHeaderData.namaKetuaRw}`}
              className="font-bold underline uppercase tracking-wide"
            >
              {currentHeaderData.namaKetuaRw || "...................................."}
            </div>
          </div>

          {/* Kanan: Tanggal & TTD Ketua RT */}
          <div className="text-center w-[250px] mx-auto">
            <div key={`tgl-${currentHeaderData.tanggalUsulan}-${currentHeaderData.tahunUsulan}`}>
              Cimanggu I , {currentHeaderData.tanggalUsulan ? (currentHeaderData.tanggalUsulan.includes(currentHeaderData.tahunUsulan) ? currentHeaderData.tanggalUsulan : `${currentHeaderData.tanggalUsulan} ${currentHeaderData.tahunUsulan}`) : "...................."}
            </div>
            <div key={`rt-ttd-${currentHeaderData.rtNo}`}>
              Ketua RT {currentHeaderData.rtNo || ".........."}
            </div>
            <div className="h-20"></div>
            <div
              key={`rt-nama-${currentHeaderData.namaKetuaRt}`}
              className="font-bold underline uppercase tracking-wide"
            >
              {currentHeaderData.namaKetuaRt || "...................................."}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-end text-[11pt] mt-8 notranslate" translate="no">
          <div className="text-center w-[280px] mr-8">
            <div key={`tgl-rw-${currentHeaderData.tanggalUsulan}-${currentHeaderData.tahunUsulan}`}>
              Cimanggu I , {currentHeaderData.tanggalUsulan ? (currentHeaderData.tanggalUsulan.includes(currentHeaderData.tahunUsulan) ? currentHeaderData.tanggalUsulan : `${currentHeaderData.tanggalUsulan} ${currentHeaderData.tahunUsulan}`) : "...................."}
            </div>
            <div key={`rw-ttd-only-${currentHeaderData.rwNo}`}>
              Ketua RW {currentHeaderData.rwNo || ".........."}
            </div>
            <div className="h-20"></div>
            <div
              key={`rw-nama-only-${currentHeaderData.namaKetuaRw}`}
              className="font-bold underline uppercase tracking-wide"
            >
              {currentHeaderData.namaKetuaRw || "...................................."}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-20 font-sans">
      {/* CSS PRINT RULES FOR EXACT F4 LANDSCAPE CAMBRIA FORMAT */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #draft-usulan-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #draft-usulan-print-mount-root {
            display: block !important;
            visibility: visible !important;
          }

          #draft-usulan-print-portal {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            margin: 0 auto !important;
            padding: 5mm 10mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
            box-sizing: border-box !important;
          }

          #draft-usulan-print-portal * {
            box-sizing: border-box !important;
          }

          #draft-usulan-print-portal table {
            width: 100% !important;
            border-collapse: collapse !important;
            display: table !important;
          }

          #draft-usulan-print-portal tr {
            display: table-row !important;
          }

          #draft-usulan-print-portal td, #draft-usulan-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
          }

          @page {
            size: 330.2mm 215.9mm; /* F4 Landscape Dimensions */
            margin: 10mm 15mm; /* Symmetric margins left and right */
          }
        }
      `}} />

      {/* TOP TOOLBAR */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-all cursor-pointer min-w-[44px] min-h-[44px]"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 mb-1">
              <Sparkles size={12} className="text-amber-600" />
              <span>{isRt ? `DRAFT USULAN PEMBANGUNAN RT ${activeRt}` : `REKAPAN DRAFT USULAN PEMBANGUNAN RW ${activeRw}`}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              {isRt ? `Form Usulan Perencanaan Pembangunan RT ${activeRt} / RW ${activeRw}` : `Rekapan Form Usulan Perencanaan Pembangunan RW ${activeRw}`}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Format Resmi Cetak F4 Landscape (Font Cambria) Persis Lampiran Gambar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isRt && (
            <>
              {/* DROPDOWN ARSIP MUSRENBANG */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300">
                <Archive size={15} className="text-emerald-600 shrink-0" />
                <label className="text-[11px] font-black text-slate-700 whitespace-nowrap">ARSIP MUSRENBANG:</label>
                <select
                  value={selectedArchiveYear}
                  onChange={(e) => setSelectedArchiveYear(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="active">📄 Draft Usulan Aktif (Tahun Berjalan)</option>
                  <option value="2026">📁 Arsip Tahun 2026</option>
                  <option value="2025">📁 Arsip Tahun 2025</option>
                  <option value="2024">📁 Arsip Tahun 2024</option>
                  <option value="2023">📁 Arsip Tahun 2023</option>
                </select>
              </div>

              {/* BUTTON SIMPAN KE ARSIP MUSRENBANG */}
              {selectedArchiveYear === "active" && (
                <button
                  type="button"
                  onClick={handleSaveToArchive}
                  disabled={usulanList.length === 0}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px] ${
                    usulanList.length > 0
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <FolderArchive size={16} />
                  <span>Simpan ke Arsip Musrenbang</span>
                </button>
              )}
            </>
          )}

          {isRt && (
            <button
              type="button"
              onClick={handleSendToRw}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px] ${
                isSent 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              }`}
            >
              <Send size={16} />
              <span>{isSent ? `Terkirim ke RW ${activeRw} (Kirim Ulang)` : `Kirim Hasil Usulan ke RW ${activeRw}`}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <Printer size={16} />
            <span>Cetak Form Usulan (F4 Landscape)</span>
          </button>
        </div>
      </div>

      {/* BANNER VIEWING ARCHIVE YEAR */}
      {!isRt && selectedArchiveYear !== "active" && (
        <div className="bg-blue-50 border-2 border-blue-500 text-blue-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md no-print">
          <div className="flex items-center gap-3">
            <Archive size={24} className="text-blue-600 shrink-0" />
            <div>
              <p className="font-extrabold text-sm uppercase">
                📌 Menampilkan Arsip Musrenbang RW {activeRw} Tahun {selectedArchiveYear}
              </p>
              <p className="text-xs text-blue-700 mt-0.5 font-medium">
                Dokumen ini merupakan arsip resmi Musrenbang yang telah disimpan. Anda dapat langsung mencetak dokumen ini.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedArchiveYear("active")}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            Kembali ke Draft Aktif
          </button>
        </div>
      )}

      {/* SUCCESS ARCHIVE ALERT */}
      {archiveSuccessMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md no-print animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">{archiveSuccessMsg}</p>
              <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                Anda dapat melihat kembali arsip ini dari dropdown &quot;ARSIP MUSRENBANG&quot; kapan saja.
              </p>
            </div>
          </div>
          <button onClick={() => setArchiveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded-lg hover:bg-emerald-100">
            ✕
          </button>
        </div>
      )}

      {revisionNote && (
        <div className="bg-amber-50 border-2 border-amber-500 text-amber-950 p-4.5 rounded-2xl flex items-start justify-between gap-3 shadow-md no-print animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle size={26} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm uppercase tracking-wide text-amber-900">
                ⚠️ CATATAN REVISI DARI KETUA RW {activeRw}:
              </p>
              <div className="text-xs text-amber-950 font-bold mt-1.5 bg-white/90 p-3 rounded-xl border border-amber-300 shadow-inner">
                &ldquo;{revisionNote}&rdquo;
              </div>
              <p className="text-xs text-amber-800 mt-1.5 font-semibold">
                Silakan sesuaikan/perbaiki tabel usulan di bawah ini, lalu klik tombol <strong>&quot;Kirim Hasil Usulan ke RW&quot;</strong> kembali.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setRevisionNote(null)} 
            className="text-amber-700 hover:text-amber-900 text-xs font-bold px-2 py-1 rounded-lg hover:bg-amber-100"
          >
            ✕
          </button>
        </div>
      )}

      {sendSuccessMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md no-print animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">{sendSuccessMsg}</p>
              <p className="text-xs text-emerald-700 mt-0.5">Hasil usulan RT {activeRt} otomatis masuk ke Rekapan Usulan RW {activeRw}.</p>
            </div>
          </div>
          <button onClick={() => setSendSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded-lg hover:bg-emerald-100">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: FORM INPUT & USULAN LIST MANAGER */}
        <div className="lg:col-span-5 space-y-4 no-print">
          {/* STAT SUMMARY MINI CARD */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Total Biaya Usulan</p>
              <p className="text-xl font-black font-mono">
                Rp {totalBiayaCalculated.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Banknote size={22} className="text-white" />
            </div>
          </div>

          {/* HEADER FORM METADATA */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">
                Identitas Wilayah & Penandatangan Usulan
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={11} className="text-emerald-600" />
                Tersimpan Otomatis
              </span>
            </div>

            {isRt ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Kp</label>
                  <input
                    type="text"
                    value={headerData.kpName}
                    onChange={(e) => setHeaderData((prev) => ({ ...prev, kpName: e.target.value }))}
                    placeholder="Ciaruteun"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">RT</label>
                  <input
                    type="text"
                    value={headerData.rtNo}
                    onChange={(e) => setHeaderData((prev) => ({ ...prev, rtNo: e.target.value }))}
                    placeholder="004"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">RW</label>
                  <input
                    type="text"
                    value={headerData.rwNo}
                    onChange={(e) => setHeaderData((prev) => ({ ...prev, rwNo: e.target.value }))}
                    placeholder="002"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-center"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Kp</label>
                  <input
                    type="text"
                    value={headerData.kpName}
                    onChange={(e) => setHeaderData((prev) => ({ ...prev, kpName: e.target.value }))}
                    placeholder="Ciaruteun"
                    disabled={selectedArchiveYear !== "active"}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">RW</label>
                  <input
                    type="text"
                    value={headerData.rwNo}
                    onChange={(e) => setHeaderData((prev) => ({ ...prev, rwNo: e.target.value }))}
                    placeholder="002"
                    disabled={selectedArchiveYear !== "active"}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-center disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Tanggal Usulan</label>
                <input
                  type="text"
                  value={headerData.tanggalUsulan}
                  onChange={(e) => setHeaderData((prev) => ({ ...prev, tanggalUsulan: e.target.value }))}
                  placeholder="16 AGUSTUS 2026"
                  disabled={!isRt && selectedArchiveYear !== "active"}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Tahun</label>
                <input
                  type="text"
                  value={headerData.tahunUsulan}
                  onChange={(e) => setHeaderData((prev) => ({ ...prev, tahunUsulan: e.target.value }))}
                  placeholder="2026"
                  disabled={!isRt && selectedArchiveYear !== "active"}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-center disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
              <div className={isRt ? "" : "col-span-2"}>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  {isRt ? "Mengetahui Ketua RW" : "Nama Ketua RW"}
                </label>
                <input
                  type="text"
                  value={headerData.namaKetuaRw}
                  onChange={(e) => setHeaderData((prev) => ({ ...prev, namaKetuaRw: e.target.value }))}
                  placeholder="SAEPULOH"
                  disabled={!isRt && selectedArchiveYear !== "active"}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold uppercase disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              {isRt && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nama Ketua RT</label>
                  <input
                    type="text"
                    value={headerData.namaKetuaRt}
                    onChange={(e) => setHeaderData((prev) => ({ ...prev, namaKetuaRt: e.target.value }))}
                    placeholder="M. HARIS"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold uppercase"
                  />
                </div>
              )}
            </div>
          </div>

          {/* EDIT ITEM MODAL / INLINE FORM */}
          {editingItem && (
            <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-400 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <Edit3 size={16} className="text-amber-600" />
                  Edit Item Usulan Kegiatan
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-lg text-amber-700 hover:bg-amber-200"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-0.5">Jenis Kegiatan</label>
                  <input
                    type="text"
                    value={editingItem.jenisKegiatan}
                    onChange={(e) => setEditingItem({ ...editingItem, jenisKegiatan: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs font-medium focus:border-amber-600 focus:outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-0.5">Volume</label>
                    <input
                      type="text"
                      value={editingItem.volume}
                      onChange={(e) => setEditingItem({ ...editingItem, volume: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs font-medium focus:border-amber-600 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-0.5">Sifat Kegiatan</label>
                    <select
                      value={editingItem.sifatKegiatan}
                      onChange={(e) => setEditingItem({ ...editingItem, sifatKegiatan: e.target.value as "BARU" | "LAMA" | "REHAB" })}
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs font-bold focus:border-amber-600 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="BARU">BARU</option>
                      <option value="LAMA">LAMA</option>
                      <option value="REHAB">REHAB</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-0.5">Besarnya Biaya (Rp)</label>
                    <input
                      type="number"
                      value={editingItem.besarnyaBiaya || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, besarnyaBiaya: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs font-semibold focus:border-amber-600 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-0.5">Keterangan</label>
                    <input
                      type="text"
                      value={editingItem.keterangan}
                      onChange={(e) => setEditingItem({ ...editingItem, keterangan: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs font-medium focus:border-amber-600 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Simpan Perubahan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FORM TAMBAH ITEM USULAN */}
          {(isRt || selectedArchiveYear === "active") && !editingItem && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">Tambah Item Usulan Kegiatan</h3>
              <form onSubmit={handleAddUsulan} className="space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Jenis Kegiatan</label>
                  <input
                    type="text"
                    value={newJenisKegiatan}
                    onChange={(e) => setNewJenisKegiatan(e.target.value)}
                    placeholder="Contoh: Pengaspalan Jalan Lingkungan Kp. Ciaruteun"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Volume</label>
                    <input
                      type="text"
                      value={newVolume}
                      onChange={(e) => setNewVolume(e.target.value)}
                      placeholder="1 Paket"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Sifat Kegiatan</label>
                    <select
                      value={newSifatKegiatan}
                      onChange={(e) => setNewSifatKegiatan(e.target.value as "BARU" | "LAMA" | "REHAB")}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:border-emerald-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="BARU">BARU</option>
                      <option value="LAMA">LAMA</option>
                      <option value="REHAB">REHAB</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Besarnya Biaya (Rp)</label>
                    <input
                      type="number"
                      value={newBesarnyaBiaya || ""}
                      onChange={(e) => setNewBesarnyaBiaya(Number(e.target.value))}
                      placeholder="120000000"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Keterangan</label>
                    <input
                      type="text"
                      value={newKeterangan}
                      onChange={(e) => setNewKeterangan(e.target.value)}
                      placeholder="Prioritas 1 RW 002"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Plus size={15} />
                  <span>Tambah Item Ke Tabel Usulan</span>
                </button>
              </form>
            </div>
          )}

          {/* DAFTAR ITEM USULAN MANAGER */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">
                Daftar Item Usulan ({currentUsulanList.length} Item)
              </h3>
            </div>

            {currentUsulanList.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Belum ada item usulan.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {currentUsulanList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs font-medium hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{idx + 1}. {item.jenisKegiatan}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Vol: {item.volume} | Sifat: <span className="font-bold text-slate-700">{item.sifatKegiatan}</span> | <span className="font-mono font-bold text-emerald-700">Rp {item.besarnyaBiaya ? Number(item.besarnyaBiaya).toLocaleString("id-ID") : 0}</span>
                      </p>
                    </div>

                    {(isRt || selectedArchiveYear === "active") && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit item"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUsulan(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW DOKUMEN CETAK F4 LANDSCAPE CAMBRIA */}
        <div className="lg:col-span-7 overflow-x-auto bg-slate-200/60 p-4 rounded-3xl border border-slate-300/80 flex justify-center items-start">
          <div className="transform scale-[0.85] origin-top sm:scale-100 transition-transform">
            <div className="text-center text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider mb-2 no-print">
              --- PREVIEW CETAK KERTAS F4 LANDSCAPE CAMBRIA (PERSIS GAMBAR) ---
            </div>
            {renderDraftUsulanContent(false)}
          </div>
        </div>
      </div>

      {/* SAFE PRINT PORTAL MOUNT */}
      <SafePrintPortal portalId="draft-usulan-print-mount-root">
        {renderDraftUsulanContent(true)}
      </SafePrintPortal>
    </div>
  );
}
