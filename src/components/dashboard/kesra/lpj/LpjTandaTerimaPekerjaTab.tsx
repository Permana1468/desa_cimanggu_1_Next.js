"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Users,
  CheckCircle2, 
  Search, 
  Plus, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  X, 
  Lock, 
  Unlock, 
  FileText, 
  Calendar,
  Building2,
  DollarSign,
  Eye,
  PenTool,
  RefreshCw,
  FileSignature
} from "lucide-react";

// Helper: Calculate Backwards Dates for Hari-Orang-Kerja (HOK)
function calculateBackwardsDates(endDateStr: string, totalDays: number) {
  const dates = [];
  const end = new Date(endDateStr);
  if (isNaN(end.getTime())) {
    for (let i = 1; i <= totalDays; i++) {
      dates.push({ dayIndex: i, dateStr: `Hari ${i}` });
    }
    return dates;
  }

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    dates.push({
      dayIndex: totalDays - i,
      dateStr: `${day}/${month}/${year}`
    });
  }
  return dates;
}

function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const BULAN_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

// Generate Realistic Handwritten Calligraphic Signature SVG
function generateWorkerSignatureSvg(name: string, dayIndex: number = 0): string {
  if (!name) return "";

  const seed = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + dayIndex * 19;
  const parts = name.trim().split(" ");
  const first = parts[0] || "A";
  const last = parts[parts.length - 1] || "";
  
  const rand = (min: number, max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset * 13) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  const c1x = rand(8, 22, 1);
  const c1y = rand(12, 28, 2);
  const c2x = rand(40, 65, 3);
  const c2y = rand(4, 18, 4);
  const c3x = rand(75, 98, 5);
  const c3y = rand(12, 32, 6);

  const strokeColor = "#0f172a"; // Dark blue/black ink
  const initial = first.charAt(0).toUpperCase();

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="60" height="22">
    <path d="M ${c1x} ${c1y} Q ${c1x + 12} ${c1y - 12}, ${c1x + 18} ${c1y - 2} T ${c2x} ${c2y} Q ${c2x + 12} ${c2y + 16}, ${c3x} ${c3y} M ${c1x - 4} ${c3y + 4} Q ${c2x} ${c3y + 7}, ${c3x + 8} ${c3y + 2}" 
          fill="none" stroke="${strokeColor}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    <text x="6" y="26" font-family="'Brush Script MT', 'Dancing Script', cursive, serif" font-size="15" font-style="italic" font-weight="bold" fill="${strokeColor}" opacity="0.95">${initial}. ${last}</text>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svgStr);
}

export function LpjTandaTerimaPekerjaTab({ session }: { session: any }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState<number>(0);

  // Lock Toggles for Headers & Signatures
  const [isHeaderLocked, setIsHeaderLocked] = useState(true);
  const [isSignaturesLocked, setIsSignaturesLocked] = useState(true);

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initial Form Data Schema (100% Matching Attached Sample Image)
  const emptyForm = {
    desa: "CIMANGGU I",
    kecamatan: "CIBUNGBULANG",
    provinsi: "JAWA BARAT",
    kegiatan: "Betonisasi Jalan Lingkungan dan Pelengkap (TPT)",
    lokasiKegiatan: "Kp. Ciaruteun Rt. 004 Rw. 008",
    masaKerjaHari: 10,
    tanggalTTD: "2025-05-02",
    upahMandor: 200000,
    upahTukang: 150000,
    upahPekerja: 120000,
    kepalaDesa: "HERNAWAN M. SODIK",
    kaurKeuangan: "ENJEN NURDIN",
    sekretarisDesa: "FAJAR TRI APRIANA",
    ketuaTpk: "M. TONNY GUNAWAN",
    workers: [
      { nama: "M. TONNY GUNAWAN", gender: "L", kategori: "Tk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Ahmad Subagja", gender: "L", kategori: "Tk", jumlahHadirHari: 3, signatureUrl: "" },
      { nama: "Ujang Iskandar", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Ade Saepudin", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Iyom Maryono", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Siti Rahmawati", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Budi Santoso", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Agus Pratama", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Dede Mulyana", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Asep Herman", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Endang Suherman", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Jaka Tarub", gender: "L", kategori: "Pk", jumlahHadirHari: 10, signatureUrl: "" },
      { nama: "Solihin", gender: "L", kategori: "Pk", jumlahHadirHari: 7, signatureUrl: "" }
    ]
  };

  const [formData, setFormData] = useState(emptyForm);

  // Load saved default headers & signatures
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDesa = localStorage.getItem("lpj_dh_desa");
      const savedKec = localStorage.getItem("lpj_dh_kecamatan");
      const savedProv = localStorage.getItem("lpj_dh_provinsi");
      const savedKades = localStorage.getItem("lpj_dh_kepala_desa");
      const savedKaur = localStorage.getItem("lpj_dh_kaur_keuangan");
      const savedSekdes = localStorage.getItem("lpj_dh_sekretaris_desa");
      const savedTpk = localStorage.getItem("lpj_dh_ketua_tpk");

      setFormData(prev => ({
        ...prev,
        desa: savedDesa || prev.desa,
        kecamatan: savedKec || prev.kecamatan,
        provinsi: savedProv || prev.provinsi,
        kepalaDesa: savedKades || prev.kepalaDesa,
        kaurKeuangan: savedKaur || prev.kaurKeuangan,
        sekretarisDesa: savedSekdes || prev.sekretarisDesa,
        ketuaTpk: savedTpk || prev.ketuaTpk
      }));
    }
  }, []);

  // Main Data List
  const [data, setData] = useState<any[]>([
    {
      id: "1",
      ...emptyForm
    }
  ]);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.kegiatan.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasiKegiatan.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalItems = filteredData.length;
  const effectiveLimit = itemsPerPage === "ALL" ? totalItems : itemsPerPage;
  const totalPages = Math.ceil(totalItems / (effectiveLimit || 1));

  const paginatedData = useMemo(() => {
    if (itemsPerPage === "ALL") return filteredData;
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleOpenDetail = (item: any) => {
    setDetailRecord(item);
    setSelectedWorkerIndex(0);
    setShowDetailModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data daftar hadir dan tanda terima upah ini?")) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  // Helper Sort Workers by Mandor (Md) -> Tukang (Tk) -> Pekerja (Pk)
  const sortWorkers = (workersList: any[]) => {
    const categoryPriority: Record<string, number> = { "Md": 1, "Tk": 2, "Pk": 3 };
    return [...workersList].sort((a, b) => (categoryPriority[a.kategori] || 99) - (categoryPriority[b.kategori] || 99));
  };

  // Calculate Total Upah for a record
  const calculateTotalWageForRecord = (record: any) => {
    if (!record || !record.workers) return 0;
    return record.workers.reduce((sum: number, w: any) => {
      const rate = w.kategori === 'Md' ? (record.upahMandor || 200000) :
                   w.kategori === 'Tk' ? (record.upahTukang || 150000) : (record.upahPekerja || 120000);
      return sum + (w.jumlahHadirHari || 0) * rate;
    }, 0);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kegiatan || !formData.lokasiKegiatan) {
      alert("Mohon isi nama kegiatan dan lokasi kegiatan!");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("lpj_dh_desa", formData.desa);
      localStorage.setItem("lpj_dh_kecamatan", formData.kecamatan);
      localStorage.setItem("lpj_dh_provinsi", formData.provinsi);
      localStorage.setItem("lpj_dh_kepala_desa", formData.kepalaDesa);
      localStorage.setItem("lpj_dh_kaur_keuangan", formData.kaurKeuangan);
      localStorage.setItem("lpj_dh_sekretaris_desa", formData.sekretarisDesa);
      localStorage.setItem("lpj_dh_ketua_tpk", formData.ketuaTpk);
    }

    const sortedWorkers = sortWorkers(formData.workers);

    if (editingId) {
      setData(prev => prev.map(d => d.id === editingId ? { ...formData, workers: sortedWorkers, id: editingId } : d));
    } else {
      const newItem = {
        ...formData,
        workers: sortedWorkers,
        id: Date.now().toString()
      };
      setData(prev => [newItem, ...prev]);
    }

    setShowModal(false);
  };

  // Add Worker Row
  const handleAddWorkerRow = () => {
    setFormData(prev => ({
      ...prev,
      workers: [
        ...prev.workers,
        {
          nama: "",
          gender: "L",
          kategori: "Pk",
          jumlahHadirHari: prev.masaKerjaHari,
          signatureUrl: ""
        }
      ]
    }));
  };

  // Remove Worker Row
  const handleRemoveWorkerRow = (index: number) => {
    if (formData.workers.length <= 1) {
      alert("Minimal harus ada 1 pekerja dalam daftar hadir & tanda terima!");
      return;
    }
    setFormData(prev => ({
      ...prev,
      workers: prev.workers.filter((_, idx) => idx !== index)
    }));
  };

  // Update Worker Field
  const handleWorkerChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newWorkers = [...prev.workers];
      newWorkers[index] = { ...newWorkers[index], [field]: value };
      return { ...prev, workers: newWorkers };
    });
  };

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !detailRecord) return;
    const dataUrl = canvas.toDataURL("image/png");

    const updatedWorkers = [...detailRecord.workers];
    updatedWorkers[selectedWorkerIndex] = {
      ...updatedWorkers[selectedWorkerIndex],
      signatureUrl: dataUrl
    };

    const updatedRecord = { ...detailRecord, workers: updatedWorkers };
    setDetailRecord(updatedRecord);
    setData(prev => prev.map(d => d.id === detailRecord.id ? updatedRecord : d));

    if (typeof window !== "undefined") {
      localStorage.setItem(`lpj_worker_sig_${detailRecord.workers[selectedWorkerIndex].nama}`, dataUrl);
    }
  };

  const generateAutoSignatureForSelected = () => {
    if (!detailRecord) return;
    const worker = detailRecord.workers[selectedWorkerIndex];
    if (!worker) return;

    const autoSvgUrl = generateWorkerSignatureSvg(worker.nama, 0);

    const updatedWorkers = [...detailRecord.workers];
    updatedWorkers[selectedWorkerIndex] = {
      ...updatedWorkers[selectedWorkerIndex],
      signatureUrl: autoSvgUrl
    };

    const updatedRecord = { ...detailRecord, workers: updatedWorkers };
    setDetailRecord(updatedRecord);
    setData(prev => prev.map(d => d.id === detailRecord.id ? updatedRecord : d));

    if (typeof window !== "undefined") {
      localStorage.setItem(`lpj_worker_sig_${worker.nama}`, autoSvgUrl);
    }
  };

  // PRINT LANDSCAPE DAFTAR HADIR DAN TANDA TERIMA UPAH TENAGA KERJA (100% REVISED PER REVISION 1, 2, 3, 4)
  const handlePrintDocument = (record: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sortedWorkers = sortWorkers(record.workers || []);
    const dateColumns = calculateBackwardsDates(record.tanggalTTD, record.masaKerjaHari || 10);

    // Calculate Column Summaries
    let totalL = 0, totalP = 0;
    let countMd = 0, countTk = 0, countPk = 0;
    let sumHokMd = 0, sumHokTk = 0, sumHokPk = 0;
    let grandTotalWage = 0;

    sortedWorkers.forEach((w: any) => {
      if (w.gender === 'L') totalL++;
      if (w.gender === 'P') totalP++;

      const hadir = w.jumlahHadirHari || 0;
      const rate = w.kategori === 'Md' ? (record.upahMandor || 200000) :
                   w.kategori === 'Tk' ? (record.upahTukang || 150000) : (record.upahPekerja || 120000);
      const wage = hadir * rate;
      grandTotalWage += wage;

      if (w.kategori === 'Md') {
        countMd++;
        sumHokMd += hadir;
      } else if (w.kategori === 'Tk') {
        countTk++;
        sumHokTk += hadir;
      } else {
        countPk++;
        sumHokPk += hadir;
      }
    });

    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Daftar Hadir Dan Tanda Terima Upah Tenaga Kerja - ${record.kegiatan}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 9.5pt;
      color: #000;
      background: #fff;
      line-height: 1.2;
    }

    /* DEFAULT F4 / FOLIO LANDSCAPE (330mm x 215mm) */
    @page {
      size: 330mm 215mm;
      margin: 12mm 15mm 10mm 15mm;
    }

    .doc-page {
      width: 100%;
      box-sizing: border-box;
      padding: 0;
      position: relative;
    }

    /* TITLE HEADER */
    .title-header {
      text-align: center;
      margin-bottom: 12px;
    }
    .title-main {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      text-decoration: underline;
      text-transform: uppercase;
    }

    /* TOP METADATA 2-COLUMN TABLE */
    .top-meta {
      width: 100%;
      margin-bottom: 8px;
      font-size: 9pt;
    }
    .top-meta td {
      vertical-align: top;
      border: none;
      padding: 1px 0;
    }

    /* MAIN TABLE WITH CRISP SINGLE SOLID BLACK BORDERS ALWAYS (COLLAPSED & NO DOUBLE RIGHT LINE) */
    table.tbl-ttd {
      width: 100%;
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      border: 1.5px solid #000;
      margin-bottom: 15px;
      table-layout: auto;
    }
    table.tbl-ttd th, table.tbl-ttd td {
      border: 1px solid #000 !important;
      padding: 3px 2px;
      font-size: 8.5pt;
      text-align: center;
      vertical-align: middle;
    }
    table.tbl-ttd th {
      font-weight: bold;
      background-color: #cbd5e1;
    }

    .bg-summary {
      background-color: #94a3b8 !important;
      font-weight: bold;
    }
    .bg-shaded {
      background-color: #cbd5e1 !important;
    }

    /* SIGNATURES 4-COLUMNS */
    .sig-table {
      width: 100%;
      margin-top: 20px;
      border: none;
    }
    .sig-table td {
      border: none;
      text-align: center;
      vertical-align: top;
      font-size: 9pt;
      width: 25%;
    }

    /* PRINT CONTROLS */
    .pcontrols {
      position: fixed;
      top: 12px;
      right: 12px;
      display: flex;
      gap: 6px;
      z-index: 999;
      background: #ffffff;
      padding: 8px 12px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 1px solid #cbd5e1;
    }
    .pcontrols button {
      padding: 5px 12px;
      border-radius: 6px;
      border: 1.5px solid #334155;
      cursor: pointer;
      font-size: 11px;
      font-weight: bold;
      font-family: Arial, sans-serif;
      background: #f8fafc;
      color: #334155;
      transition: all 0.15s;
    }
    .pcontrols button:hover, .pcontrols button.on {
      background: #e11d48;
      color: #ffffff;
      border-color: #e11d48;
    }

    @media print {
      .no-print { display: none !important; }
    }
  </style>

  <style id="pgstyle">
    @page { size: 330mm 215mm; margin: 12mm 15mm 10mm 15mm; }
  </style>

  <script>
    function setSize(sz, btnId) {
      document.getElementById('pgstyle').textContent = '@page { size: ' + sz + '; margin: 12mm 15mm 10mm 15mm; }';
      document.querySelectorAll('.pcontrols button').forEach(function(b) { b.classList.remove('on'); });
      var el = document.getElementById(btnId); if (el) el.classList.add('on');
    }
  </script>
</head>
<body>

  <!-- Controls -->
  <div class="pcontrols no-print">
    <button id="bf4l" class="on" onclick="setSize('330mm 215mm','bf4l')">F4 Landscape (Folio)</button>
    <button id="ba4l" onclick="setSize('297mm 210mm','ba4l')">A4 Landscape</button>
    <button onclick="window.print()" style="background:#16a34a;color:#fff;border-color:#16a34a;">&#128438; Cetak Dokumen</button>
  </div>

  <div class="doc-page">
    <!-- TITLE HEADER -->
    <div class="title-header">
      <div class="title-main">DAFTAR HADIR DAN TANDA TERIMA UPAH TENAGA KERJA</div>
    </div>

    <!-- TOP METADATA -->
    <table class="top-meta">
      <tr>
        <td style="width: 50%;">
          <table>
            <tr><td style="width: 100px;">DESA</td><td>: ${record.desa}</td></tr>
            <tr><td>KECAMATAN</td><td>: ${record.kecamatan}</td></tr>
            <tr><td>PROVINSI</td><td>: ${record.provinsi}</td></tr>
          </table>
        </td>
        <td style="width: 50%;">
          <table>
            <tr><td style="width: 110px;">Kegiatan</td><td>: ${record.kegiatan}</td></tr>
            <tr><td>Lokasi Kegiatan</td><td>: ${record.lokasiKegiatan}</td></tr>
            <tr><td>Masa Kerja</td><td>: ${record.masaKerjaHari} Hari</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- MAIN TABLE (REVISION 1: NO EXTRA LINE UNDER L/P, REVISION 2: CHECKMARK ONLY IN DATE CELLS, REVISION 3: NO '0' ROW, REVISION 4: INTEGRATED WORKER TTD & SINGLE RIGHT BORDER) -->
    <table class="tbl-ttd">
      <thead>
        <tr>
          <th style="width: 28px;" rowspan="2">No</th>
          <th style="width: 180px;" rowspan="2">Nama</th>
          <th style="width: 18px; padding: 4px 2px;">L</th>
          <th style="width: 18px; padding: 4px 2px;">P</th>
          <th colspan="3">Kategori</th>
          <th colspan="${dateColumns.length}">Hari-Orang-Kerja (HOK)<br>Menurut Tanggal</th>
          <th colspan="3">Jmlh HOK</th>
          <th rowspan="2">Jumlah Upah<br>Total<br>(RP)</th>
          <th style="width: 150px;" rowspan="2">Tanda Tangan / Cap Jempol<br>Tangan Kiri</th>
        </tr>
        <tr>
          <th style="width: 22px;">Md</th>
          <th style="width: 22px;">Tk</th>
          <th style="width: 22px;">Pk</th>
          ${dateColumns.map(d => `
            <th style="padding: 2px 1px;">
              <div style="font-size: 8pt; font-weight: bold;">${d.dayIndex}</div>
              <div style="font-size: 6.5pt; font-weight: normal;">${d.dateStr}</div>
            </th>
          `).join('')}
          <th style="width: 22px;">Md</th>
          <th style="width: 22px;">Tk</th>
          <th style="width: 22px;">Pk</th>
        </tr>
      </thead>
      <tbody>
        ${sortedWorkers.map((w: any, idx: number) => {
          const rowNum = idx + 1;
          const isOdd = rowNum % 2 !== 0;
          const hadir = w.jumlahHadirHari || 0;
          const rate = w.kategori === 'Md' ? (record.upahMandor || 200000) :
                       w.kategori === 'Tk' ? (record.upahTukang || 150000) : (record.upahPekerja || 120000);
          const totalWage = hadir * rate;

          // Integrated TTD from Daftar Hadir / localStorage
          let savedSig = "";
          if (typeof window !== "undefined") {
            savedSig = localStorage.getItem(`lpj_worker_sig_${w.nama}`) || "";
          }
          const sigImg = w.signatureUrl || savedSig || generateWorkerSignatureSvg(w.nama, 0);

          return `
            <tr>
              <td style="text-align: center;">${rowNum}</td>
              <td style="text-align: left; padding-left: 6px;">${w.nama}</td>
              <td style="text-align: center;">${w.gender === 'L' ? '√' : ''}</td>
              <td style="text-align: center;">${w.gender === 'P' ? '√' : ''}</td>
              <td style="text-align: center;">${w.kategori === 'Md' ? '√' : ''}</td>
              <td style="text-align: center;">${w.kategori === 'Tk' ? '√' : ''}</td>
              <td style="text-align: center;">${w.kategori === 'Pk' ? '√' : ''}</td>
              ${dateColumns.map((_, dayIdx) => {
                const isPresent = dayIdx < hadir;
                return `
                  <td style="text-align: center; height: 24px; font-weight: bold;">
                    ${isPresent ? '√' : ''}
                  </td>
                `;
              }).join('')}
              <td style="text-align: center; font-weight: bold;">${w.kategori === 'Md' ? hadir : ''}</td>
              <td style="text-align: center; font-weight: bold;">${w.kategori === 'Tk' ? hadir : ''}</td>
              <td style="text-align: center; font-weight: bold;">${w.kategori === 'Pk' ? hadir : ''}</td>
              <td style="text-align: right; padding-right: 6px; font-weight: bold; font-size: 8pt;">
                ${formatRupiah(totalWage)}
              </td>
              <td style="padding: 0 4px; text-align: ${isOdd ? 'left' : 'right'}; vertical-align: middle; height: 26px;">
                <div style="display: flex; align-items: center; justify-content: ${isOdd ? 'flex-start' : 'flex-end'}; gap: 4px;">
                  <span style="font-size: 7.5pt; font-weight: bold;">${rowNum}</span>
                  <img src="${sigImg}" style="max-height: 22px; max-width: 55px; vertical-align: middle;" alt="TTD" />
                </div>
              </td>
            </tr>
          `;
        }).join('')}

        <!-- MAIN SUMMARY TOTALS ROW (NO '0' SUBROW, CLEAN SINGLE RIGHT BORDER) -->
        <tr class="bg-summary">
          <td colspan="2" style="text-align: center; font-weight: bold;">Jumlah</td>
          <td style="text-align: center; font-weight: bold;">${totalL}</td>
          <td style="text-align: center; font-weight: bold;">${totalP}</td>
          <td style="text-align: center; font-weight: bold;">${countMd}</td>
          <td style="text-align: center; font-weight: bold;">${countTk}</td>
          <td style="text-align: center; font-weight: bold;">${countPk}</td>
          <td colspan="${dateColumns.length}" style="text-align: center; font-weight: bold;">Jumlah</td>
          <td style="text-align: center; font-weight: bold;">${sumHokMd}</td>
          <td style="text-align: center; font-weight: bold;">${sumHokTk}</td>
          <td style="text-align: center; font-weight: bold;">${sumHokPk}</td>
          <td style="text-align: right; padding-right: 6px; font-weight: bold; font-size: 8.5pt;">
            ${formatRupiah(grandTotalWage)}
          </td>
          <td class="${sortedWorkers.length % 2 !== 0 ? 'bg-shaded' : ''}"></td>
        </tr>
      </tbody>
    </table>

    <!-- 4 SIGNATURE COLUMNS -->
    <table class="sig-table">
      <tr>
        <td>
          Disetujui,<br>
          Kepala Desa Cimanggu I<br><br><br><br><br>
          <u><b>${record.kepalaDesa}</b></u>
        </td>
        <td>
          Dibayar lunas<br>
          Kaur Keuangan Desa Cimanggu I<br><br><br><br><br>
          <u><b>${record.kaurKeuangan}</b></u>
        </td>
        <td>
          Telah Diverifikasi<br>
          Sekretaris Desa Cimanggu I<br><br><br><br><br>
          <u><b>${record.sekretarisDesa}</b></u>
        </td>
        <td>
          Cimanggu I, ${formatDateIndo(record.tanggalTTD)}<br>
          Tim Pelaksana Kegiatan (TPK)<br><br><br><br><br>
          <u><b>${record.ketuaTpk}</b></u>
        </td>
      </tr>
    </table>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <CheckCircle2 size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">4. Tanda Terima Pekerja & Tanda Terima Upah</h1>
              <p className="text-xs text-slate-500">Daftar Hadir Dan Tanda Terima Upah Tenaga Kerja Pembangunan Desa</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Plus size={16} />
            <span>+ Buat Tanda Terima Upah</span>
          </button>
        </div>
      </div>

      {/* Filter & Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari kegiatan / lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-bold text-slate-500">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const val = e.target.value;
                setItemsPerPage(val === "ALL" ? "ALL" : parseInt(val));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value={10}>10 Data</option>
              <option value={25}>25 Data</option>
              <option value={50}>50 Data</option>
              <option value={100}>100 Data</option>
              <option value="ALL">Semua Data</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Nama Kegiatan</th>
                <th className="px-6 py-4">Lokasi Kegiatan</th>
                <th className="px-6 py-4">Masa Kerja</th>
                <th className="px-6 py-4">Jumlah Pekerja</th>
                <th className="px-6 py-4">Total Upah (RP)</th>
                <th className="px-6 py-4 text-center">Cetak Tanda Terima (F4)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <CheckCircle2 size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">Belum ada data tanda terima upah pekerja.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-xs">
                      <div>{item.kegiatan}</div>
                      <div className="text-xs font-normal text-slate-400">{item.desa}, {item.kecamatan}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">{item.lokasiKegiatan}</td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {item.masaKerjaHari} Hari Kerja
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {item.workers?.length || 0} Orang Pekerja
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-emerald-700">
                      {formatRupiah(calculateTotalWageForRecord(item))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handlePrintDocument(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Printer size={14} />
                        <span>Cetak Tanda Terima (F4)</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                          title="Detail Pekerja & TTD"
                        >
                          <Eye size={14} />
                          <span>Detail & TTD</span>
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="text-slate-500 font-bold">
            {totalItems === 0
              ? "Tidak ada data tanda terima pekerja."
              : itemsPerPage === "ALL"
              ? `Menampilkan seluruh ${totalItems} data.`
              : `Menampilkan ${(currentPage - 1) * (itemsPerPage as number) + 1} - ${Math.min(currentPage * (itemsPerPage as number), totalItems)} dari ${totalItems} data.`}
          </div>

          {itemsPerPage !== "ALL" && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                    currentPage === pg
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pg}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL WORKERS & SIGNATURE MANAGEMENT MODAL */}
      {showDetailModal && detailRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold">
                  <FileSignature size={22} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Detail Pekerja, Honor Upah & Tanda Tangan Digital
                  </h2>
                  <p className="text-xs text-slate-500">
                    Kegiatan: <span className="font-bold text-slate-700">{detailRecord.kegiatan}</span> • Total {detailRecord.workers?.length || 0} Tenaga Kerja
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* TWO-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
              {/* LEFT LIST: WORKERS (6 COLS) */}
              <div className="md:col-span-6 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Daftar Pekerja & Rincian Honor ({detailRecord.workers?.length || 0} Orang)
                </h3>

                {detailRecord.workers.map((w: any, idx: number) => {
                  const isSelected = selectedWorkerIndex === idx;
                  const rate = w.kategori === 'Md' ? (detailRecord.upahMandor || 200000) :
                               w.kategori === 'Tk' ? (detailRecord.upahTukang || 150000) : (detailRecord.upahPekerja || 120000);
                  const totalUpah = (w.jumlahHadirHari || 0) * rate;

                  let savedSig = "";
                  if (typeof window !== "undefined") {
                    savedSig = localStorage.getItem(`lpj_worker_sig_${w.nama}`) || "";
                  }
                  const sigPreview = w.signatureUrl || savedSig || generateWorkerSignatureSvg(w.nama, 0);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedWorkerIndex(idx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? "bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20" 
                          : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                          w.kategori === 'Md' ? 'bg-amber-100 text-amber-800' :
                          w.kategori === 'Tk' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <span>{w.nama}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {w.kategori === 'Md' ? 'Mandor' : w.kategori === 'Tk' ? 'Tukang' : 'Pekerja'}
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                            {w.jumlahHadirHari || 0} Hari x {formatRupiah(rate)} = <span className="underline">{formatRupiah(totalUpah)}</span>
                          </div>
                        </div>
                      </div>

                      {/* TTD Preview */}
                      <div className="flex items-center gap-2">
                        <img 
                          src={sigPreview} 
                          alt="TTD" 
                          className="h-7 w-auto bg-white p-1 rounded-lg border border-slate-200 shadow-xs" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT SIDE: SIGNATURE CANVAS & AUTO GENERATOR (6 COLS) */}
              <div className="md:col-span-6 bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                {detailRecord.workers[selectedWorkerIndex] ? (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Terpilih ({selectedWorkerIndex + 1})</span>
                        <h4 className="font-bold text-sm text-slate-800">
                          {detailRecord.workers[selectedWorkerIndex].nama}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                        {detailRecord.workers[selectedWorkerIndex].kategori === 'Md' ? 'Mandor' : detailRecord.workers[selectedWorkerIndex].kategori === 'Tk' ? 'Tukang' : 'Pekerja'}
                      </span>
                    </div>

                    {/* Canvas Drawing Area */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <PenTool size={14} className="text-indigo-600" />
                          <span>Tanda Tangan Manual (Coret Kertas Digital)</span>
                        </span>
                        <span className="text-[10px] font-normal text-slate-400">Mouse / Touchscreen</span>
                      </label>

                      <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-2 relative">
                        <canvas
                          ref={canvasRef}
                          width={360}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-28 bg-white cursor-crosshair rounded-xl touch-none"
                        />
                        <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-bold pointer-events-none">
                          Area TTD Tanda Terima
                        </div>
                      </div>
                    </div>

                    {/* Canvas Action Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw size={13} />
                        <span>Hapus Canvas</span>
                      </button>

                      <button
                        type="button"
                        onClick={saveCanvasSignature}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-1"
                      >
                        <PenTool size={13} />
                        <span>Simpan Hasil TTD Manual</span>
                      </button>
                    </div>

                    {/* Auto Signature Generator Option */}
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Atau Generasikan TTD Otomatis (Rapi & Organik)
                      </label>
                      <button
                        type="button"
                        onClick={generateAutoSignatureForSelected}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                      >
                        <FileSignature size={15} />
                        <span>Buat TTD Otomatis Presisi Rapi</span>
                      </button>
                    </div>

                    {/* Current Signature Preview */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">Pratinjau TTD Aktif Pada Tabel Tanda Terima:</span>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-center">
                        <img 
                          src={detailRecord.workers[selectedWorkerIndex].signatureUrl || (typeof window !== 'undefined' ? localStorage.getItem(`lpj_worker_sig_${detailRecord.workers[selectedWorkerIndex].nama}`) : '') || generateWorkerSignatureSvg(detailRecord.workers[selectedWorkerIndex].nama, 0)} 
                          alt="Pratinjau TTD" 
                          className="h-10 w-auto"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <PenTool size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-xs text-slate-600">Pilih pekerja di sebelah kiri untuk mengelola TTD.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => handlePrintDocument(detailRecord)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Printer size={15} />
                <span>Cetak Tanda Terima (F4)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL (+ Buat Tanda Terima Upah / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold">
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {editingId ? "Edit Tanda Terima Upah Pekerja" : "Form Pengisian Tanda Terima Upah Pekerja"}
                  </h2>
                  <p className="text-xs text-slate-500">Kelola tarif harian, jumlah kehadiran HOK, dan honor upah pekerja</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-6 mt-6">
              {/* SECTION 1: DESA, KECAMATAN, PROVINSI */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={16} />
                    <span>1. Identitas Wilayah Desa</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsHeaderLocked(!isHeaderLocked)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    {isHeaderLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    <span>{isHeaderLocked ? "Terkunci" : "Buka Kunci"}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Desa</label>
                    <input 
                      type="text"
                      value={formData.desa}
                      disabled={isHeaderLocked}
                      onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold uppercase text-xs disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
                    <input 
                      type="text"
                      value={formData.kecamatan}
                      disabled={isHeaderLocked}
                      onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold uppercase text-xs disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
                    <input 
                      type="text"
                      value={formData.provinsi}
                      disabled={isHeaderLocked}
                      onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold uppercase text-xs disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 & 3: KEGIATAN & LOKASI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. Nama Kegiatan Pembangunan</label>
                  <input 
                    type="text"
                    value={formData.kegiatan}
                    onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
                    placeholder="Contoh: Betonisasi Jalan Lingkungan dan Pelengkap (TPT)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. Lokasi Kegiatan</label>
                  <input 
                    type="text"
                    value={formData.lokasiKegiatan}
                    onChange={(e) => setFormData({ ...formData, lokasiKegiatan: e.target.value })}
                    placeholder="Contoh: Kp. Ciaruteun Rt. 004 Rw. 008"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              {/* SECTION 4: MASA KERJA & TARIF UPAH HARIAN */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl space-y-4 border border-emerald-100 text-xs">
                <h3 className="font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign size={16} />
                  <span>4. Masa Kerja & Tarif Standar Upah Harian (Rp)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Masa Kerja (Hari)</label>
                    <input 
                      type="number"
                      min={1}
                      max={30}
                      value={formData.masaKerjaHari}
                      onChange={(e) => setFormData({ ...formData, masaKerjaHari: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Upah Mandor / Hari (RP)</label>
                    <input 
                      type="number"
                      step={5000}
                      value={formData.upahMandor}
                      onChange={(e) => setFormData({ ...formData, upahMandor: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs text-emerald-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Upah Tukang / Hari (RP)</label>
                    <input 
                      type="number"
                      step={5000}
                      value={formData.upahTukang}
                      onChange={(e) => setFormData({ ...formData, upahTukang: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs text-emerald-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Upah Pekerja / Hari (RP)</label>
                    <input 
                      type="number"
                      step={5000}
                      value={formData.upahPekerja}
                      onChange={(e) => setFormData({ ...formData, upahPekerja: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs text-emerald-700"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: DAFTAR TENAGA KERJA & JUMLAH KEHADIRAN HOK */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} />
                    <span>5. Daftar Pekerja & Jumlah Kehadiran (Hitung Otomatis Total Upah)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddWorkerRow}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20"
                  >
                    <Plus size={14} />
                    <span>+ Tambah Pekerja</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.workers.map((w, idx) => {
                    const rate = w.kategori === 'Md' ? formData.upahMandor :
                                 w.kategori === 'Tk' ? formData.upahTukang : formData.upahPekerja;
                    const totalUpah = (w.jumlahHadirHari || 0) * rate;

                    return (
                      <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <span className="font-bold text-slate-400 w-6 text-center">{idx + 1}.</span>
                        
                        {/* Nama */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={w.nama}
                            onChange={(e) => handleWorkerChange(idx, "nama", e.target.value)}
                            placeholder="Nama Lengkap Pekerja"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs"
                            required
                          />
                        </div>

                        {/* JK */}
                        <div className="w-16">
                          <select
                            value={w.gender}
                            onChange={(e) => handleWorkerChange(idx, "gender", e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-slate-200 font-bold text-xs text-center"
                          >
                            <option value="L">L</option>
                            <option value="P">P</option>
                          </select>
                        </div>

                        {/* Kategori */}
                        <div className="w-28">
                          <select
                            value={w.kategori}
                            onChange={(e) => handleWorkerChange(idx, "kategori", e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-slate-200 font-bold text-xs text-center bg-emerald-50 text-emerald-800"
                          >
                            <option value="Md">Mandor (Md)</option>
                            <option value="Tk">Tukang (Tk)</option>
                            <option value="Pk">Pekerja (Pk)</option>
                          </select>
                        </div>

                        {/* Jmlh Kehadiran Hari */}
                        <div className="w-24">
                          <input
                            type="number"
                            min={1}
                            max={formData.masaKerjaHari}
                            value={w.jumlahHadirHari}
                            onChange={(e) => handleWorkerChange(idx, "jumlahHadirHari", parseInt(e.target.value) || 0)}
                            placeholder="Jmlh Hari"
                            className="w-full px-2 py-2 rounded-lg border border-slate-200 font-bold text-xs text-center"
                            required
                          />
                        </div>

                        {/* Total Upah (Calculated) */}
                        <div className="w-32 text-right px-2 font-bold text-emerald-700 text-xs">
                          {formatRupiah(totalUpah)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveWorkerRow(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Pekerja"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 6: PENANDATANGAN 4 PEJABAT */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} />
                    <span>6. Penandatanganan Dokumen (4 Pejabat TPK & Desa)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSignaturesLocked(!isSignaturesLocked)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    {isSignaturesLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    <span>{isSignaturesLocked ? "Terkunci" : "Buka Kunci"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kepala Desa</label>
                    <input 
                      type="text"
                      value={formData.kepalaDesa}
                      disabled={isSignaturesLocked}
                      onChange={(e) => setFormData({ ...formData, kepalaDesa: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold uppercase text-xs disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kaur Keuangan Desa</label>
                    <input 
                      type="text"
                      value={formData.kaurKeuangan}
                      disabled={isSignaturesLocked}
                      onChange={(e) => setFormData({ ...formData, kaurKeuangan: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold uppercase text-xs disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sekretaris Desa</label>
                    <input 
                      type="text"
                      value={formData.sekretarisDesa}
                      disabled={isSignaturesLocked}
                      onChange={(e) => setFormData({ ...formData, sekretarisDesa: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold uppercase text-xs disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ketua TPK</label>
                    <input 
                      type="text"
                      value={formData.ketuaTpk}
                      disabled={isSignaturesLocked}
                      onChange={(e) => setFormData({ ...formData, ketuaTpk: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold uppercase text-xs disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Tanda Terima Upah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
