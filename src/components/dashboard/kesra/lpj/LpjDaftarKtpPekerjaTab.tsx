"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { 
  Fingerprint, 
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
  Upload, 
  CheckCircle2, 
  Building2, 
  Eye, 
  Image as ImageIcon,
  Users,
  RefreshCw
} from "lucide-react";

// Helper: Format Lokasi Kegiatan (Auto Uppercase & Standardize RT/RW)
function formatLokasiKegiatan(inputStr: string): string {
  if (!inputStr) return "";
  let str = inputStr.toUpperCase().trim();
  
  // Standardize KP.
  str = str.replace(/^KAMPUNG\s+/i, "KP. ");

  // Standardize RT (e.g. Rt.04, rt. 4, RT 4 -> RT. 004)
  str = str.replace(/RT[\.\s]*0*(\d+)/gi, (_, num) => `RT. ${String(num).padStart(3, "0")}`);
  
  // Standardize RW (e.g. Rw.01, rw. 1, RW 1 -> RW. 001)
  str = str.replace(/RW[\.\s]*0*(\d+)/gi, (_, num) => `RW. ${String(num).padStart(3, "0")}`);

  // Standardize separator if RT. 004/RW. 001 -> RT. 004 RW. 001
  str = str.replace(/RT\.\s*(\d{3})[\/\,\s]+RW\.\s*(\d{3})/gi, "RT. $1 RW. $2");

  return str;
}

// Helper: Format Kegiatan (Auto Uppercase)
function formatNamaKegiatan(inputStr: string): string {
  if (!inputStr) return "";
  let str = inputStr.toUpperCase().trim();
  if (!str.startsWith("KEGIATAN ") && !str.startsWith("BETONISASI") && !str.startsWith("PEMBANGUNAN")) {
    // Keep clean
  }
  return str;
}

// Generate Realistic KTP Graphic SVG if no image uploaded
function generateRealisticKtpSvg(nik: string, name: string, gender: string, address: string): string {
  const cleanNik = nik || "320112" + Math.floor(1000000000 + Math.random() * 900000000);
  const cleanName = (name || "PEKERJA DESA").toUpperCase();
  const cleanGender = gender === "P" ? "PEREMPUAN" : "LAKI-LAKI";
  const cleanAddr = (address || "KP. CIMANGGU RT. 004 RW. 001").toUpperCase();

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260" width="420" height="260">
    <rect x="0" y="0" width="420" height="260" rx="14" fill="#a4c2f4" stroke="#4a86e8" stroke-width="2" />
    <!-- KTP Header -->
    <text x="210" y="24" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#0b5394">PROVINSI JAWA BARAT</text>
    <text x="210" y="40" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#0b5394">KABUPATEN BOGOR</text>
    
    <!-- NIK -->
    <text x="20" y="66" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#000">NIK</text>
    <text x="90" y="66" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#000">: ${cleanNik}</text>

    <!-- Details -->
    <text x="20" y="88" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Nama</text>
    <text x="100" y="88" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">: ${cleanName}</text>

    <text x="20" y="106" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Tempat/Tgl Lahir</text>
    <text x="100" y="106" font-family="Arial, sans-serif" font-size="9" fill="#000">: BOGOR, 15-06-1988</text>

    <text x="20" y="124" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Jenis Kelamin</text>
    <text x="100" y="124" font-family="Arial, sans-serif" font-size="9" fill="#000">: ${cleanGender}</text>

    <text x="20" y="142" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Alamat</text>
    <text x="100" y="142" font-family="Arial, sans-serif" font-size="9" fill="#000">: ${cleanAddr}</text>

    <text x="35" y="158" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">RT/RW</text>
    <text x="100" y="158" font-family="Arial, sans-serif" font-size="9" fill="#000">: 004/001</text>

    <text x="35" y="174" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Kel/Desa</text>
    <text x="100" y="174" font-family="Arial, sans-serif" font-size="9" fill="#000">: CIMANGGU I</text>

    <text x="35" y="190" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Kecamatan</text>
    <text x="100" y="190" font-family="Arial, sans-serif" font-size="9" fill="#000">: CIBUNGBULANG</text>

    <text x="20" y="208" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Agama</text>
    <text x="100" y="208" font-family="Arial, sans-serif" font-size="9" fill="#000">: ISLAM</text>

    <text x="20" y="224" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Pekerjaan</text>
    <text x="100" y="224" font-family="Arial, sans-serif" font-size="9" fill="#000">: WIRASWASTA</text>

    <text x="20" y="240" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#000">Berlaku Hingga</text>
    <text x="100" y="240" font-family="Arial, sans-serif" font-size="9" fill="#000">: SEUMUR HIDUP</text>

    <!-- Photo Box -->
    <rect x="310" y="70" width="95" height="120" rx="4" fill="#333" stroke="#fff" stroke-width="2" />
    <circle cx="357" cy="115" r="24" fill="#666" />
    <path d="M 330 175 Q 357 140, 384 175 Z" fill="#666" />
    <text x="357" y="210" font-family="Arial, sans-serif" font-size="8" text-anchor="middle" fill="#000">BOGOR</text>
  </svg>`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svgStr);
}

export function LpjDaftarKtpPekerjaTab({ session }: { session: any }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Detail / Preview Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);

  // Initial Form Data Schema
  const emptyForm = {
    desa: "CIMANGGU I",
    kecamatan: "CIBUNGBULANG",
    provinsi: "JAWA BARAT",
    kegiatan: "BETONISASI JALAN LINGKUNGAN DAN PELENGKAPNYA",
    lokasiKegiatan: "KP. CIMANGGU RT. 004 RW. 001",
    tanggalDokumen: "2025-04-27",
    workers: [
      { nama: "M. TONNY GUNAWAN", gender: "L", kategori: "Md", nik: "3201121005880001", ktpImgUrl: "" },
      { nama: "MADSUKI", gender: "L", kategori: "Tk", nik: "3201121506850001", ktpImgUrl: "" },
      { nama: "SUPRIADI Z", gender: "L", kategori: "Tk", nik: "3201120706740004", ktpImgUrl: "" },
      { nama: "PAUZI HIDAYAT", gender: "L", kategori: "Pk", nik: "3201160107820005", ktpImgUrl: "" },
      { nama: "SALAM SUKARDI", gender: "L", kategori: "Pk", nik: "3201161512800002", ktpImgUrl: "" },
      { nama: "SUTISNA", gender: "L", kategori: "Pk", nik: "3201162404690002", ktpImgUrl: "" },
      { nama: "M ABI SALIM", gender: "L", kategori: "Pk", nik: "3201163005720001", ktpImgUrl: "" },
      { nama: "GOPAR", gender: "L", kategori: "Pk", nik: "3201160805720001", ktpImgUrl: "" },
      { nama: "M. YUNUS", gender: "L", kategori: "Pk", nik: "3201160101890006", ktpImgUrl: "" }
    ]
  };

  const [formData, setFormData] = useState(emptyForm);
  const [data, setData] = useState<any[]>([]);

  // AUTO-SYNC LOGIC: Load from Daftar Hadir & LocalStorage
  const syncDataFromDaftarHadir = useCallback(() => {
    if (typeof window === "undefined") return;

    let dhRecords: any[] = [];
    const savedDh = localStorage.getItem("lpj_daftar_hadir_records");
    if (savedDh) {
      try {
        dhRecords = JSON.parse(savedDh);
      } catch (e) {
        console.error(e);
      }
    }

    if (dhRecords.length === 0) {
      dhRecords = [{ id: "1", ...emptyForm }];
    }

    let ktpOverrides: Record<string, any> = {};
    const savedKtpOv = localStorage.getItem("lpj_ktp_overrides");
    if (savedKtpOv) {
      try {
        ktpOverrides = JSON.parse(savedKtpOv);
      } catch (e) {
        console.error(e);
      }
    }

    const mergedRecords = dhRecords.map((dh: any) => {
      const ov = ktpOverrides[dh.id] || {};

      const mappedWorkers = (dh.workers || []).map((w: any) => {
        const wOv = (ov.workers || []).find((ow: any) => ow.nama === w.nama);
        const savedKtpImg = localStorage.getItem(`lpj_worker_ktp_${w.nama}`) || "";

        return {
          nama: (wOv?.nama || w.nama).toUpperCase(),
          gender: w.gender || "L",
          kategori: w.kategori || "Pk",
          nik: wOv?.nik || w.nik || "320112" + Math.floor(1000000000 + Math.random() * 900000000),
          ktpImgUrl: wOv?.ktpImgUrl || savedKtpImg || ""
        };
      });

      return {
        id: dh.id,
        isSynced: true,
        desa: dh.desa,
        kecamatan: dh.kecamatan,
        provinsi: dh.provinsi,
        kegiatan: formatNamaKegiatan(ov.kegiatan || dh.kegiatan),
        lokasiKegiatan: formatLokasiKegiatan(ov.lokasiKegiatan || dh.lokasiKegiatan),
        tanggalDokumen: dh.tanggalTTD || "2025-04-27",
        workers: mappedWorkers
      };
    });

    setData(mergedRecords);
  }, []);

  useEffect(() => {
    syncDataFromDaftarHadir();
    const handleUpdate = () => syncDataFromDaftarHadir();
    window.addEventListener("lpj_dh_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("lpj_dh_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [syncDataFromDaftarHadir]);

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
    setShowDetailModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus daftar lampiran KTP pekerja ini?")) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  // Helper Sort Workers: Mandor -> Tukang -> Pekerja
  const sortWorkers = (workersList: any[]) => {
    const categoryPriority: Record<string, number> = { "Md": 1, "Tk": 2, "Pk": 3 };
    return [...workersList].sort((a, b) => (categoryPriority[a.kategori] || 99) - (categoryPriority[b.kategori] || 99));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kegiatan || !formData.lokasiKegiatan) {
      alert("Mohon isi nama kegiatan dan lokasi kegiatan!");
      return;
    }

    const cleanKegiatan = formatNamaKegiatan(formData.kegiatan);
    const cleanLokasi = formatLokasiKegiatan(formData.lokasiKegiatan);
    const sortedWorkers = sortWorkers(formData.workers.map(w => ({
      ...w,
      nama: w.nama.toUpperCase()
    })));

    if (typeof window !== "undefined" && editingId) {
      const savedKtpOv = localStorage.getItem("lpj_ktp_overrides");
      let ov: Record<string, any> = {};
      if (savedKtpOv) {
        try { ov = JSON.parse(savedKtpOv); } catch (e) {}
      }
      ov[editingId] = {
        kegiatan: cleanKegiatan,
        lokasiKegiatan: cleanLokasi,
        workers: sortedWorkers
      };
      localStorage.setItem("lpj_ktp_overrides", JSON.stringify(ov));
    }

    syncDataFromDaftarHadir();
    setShowModal(false);
  };

  // Upload KTP File Handler for a Worker
  const handleFileUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFormData(prev => {
        const newWorkers = [...prev.workers];
        newWorkers[idx] = { ...newWorkers[idx], ktpImgUrl: result };
        return { ...prev, workers: newWorkers };
      });

      const workerName = formData.workers[idx]?.nama;
      if (workerName && typeof window !== "undefined") {
        localStorage.setItem(`lpj_worker_ktp_${workerName}`, result);
      }
    };
    reader.readAsDataURL(file);
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
          nik: "320112" + Math.floor(1000000000 + Math.random() * 900000000),
          ktpImgUrl: ""
        }
      ]
    }));
  };

  // Remove Worker Row
  const handleRemoveWorkerRow = (index: number) => {
    if (formData.workers.length <= 1) {
      alert("Minimal harus ada 1 pekerja!");
      return;
    }
    setFormData(prev => ({
      ...prev,
      workers: prev.workers.filter((_, idx) => idx !== index)
    }));
  };

  // Update Worker Field (With Automatic UPPERCASE Conversion)
  const handleWorkerChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newWorkers = [...prev.workers];
      const val = field === "nama" ? String(value).toUpperCase() : value;
      newWorkers[index] = { ...newWorkers[index], [field]: val };
      return { ...prev, workers: newWorkers };
    });
  };

  // PRINT LANDSCAPE / PORTRAIT DAFTAR KTP PEKERJA (EXACTLY MATCHING ATTACHED IMAGE SAMPLE)
  const handlePrintDocument = (record: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sortedWorkers = sortWorkers(record.workers || []);
    const cleanKegiatan = formatNamaKegiatan(record.kegiatan);
    const cleanLokasi = formatLokasiKegiatan(record.lokasiKegiatan);

    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Daftar KTP Pekerja - ${cleanKegiatan}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 10pt;
      color: #000;
      background: #fff;
      line-height: 1.2;
    }

    /* DEFAULT F4 / FOLIO PORTRAIT (215mm x 330mm) */
    @page {
      size: 215mm 330mm;
      margin: 15mm 15mm 15mm 15mm;
    }

    .doc-page {
      width: 100%;
      box-sizing: border-box;
    }

    /* TITLE HEADER EXACT MATCH TO ATTACHED SAMPLE IMAGE */
    .title-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .title-main {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .title-sub {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .title-loc {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* GRID TABLE CONTAINING 2-COLUMNS KTP CARDS MATCHING SAMPLE IMAGE */
    table.ktp-grid-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #000;
      margin-bottom: 20px;
    }
    table.ktp-grid-table td {
      border: 1.5px solid #000 !important;
      padding: 0;
      vertical-align: top;
      width: 50%;
    }

    /* INNER KTP CARD CONTAINER */
    .ktp-box {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .ktp-img-area {
      padding: 10px;
      text-align: center;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 170px;
    }
    .ktp-img-area img {
      max-width: 96%;
      max-height: 165px;
      object-fit: contain;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
    }
    .ktp-label-area {
      border-top: 1.5px solid #000;
      padding: 8px 4px;
      text-align: center;
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      background: #fff;
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
    @page { size: 215mm 330mm; margin: 15mm 15mm 15mm 15mm; }
  </style>

  <script>
    function setSize(sz, btnId) {
      document.getElementById('pgstyle').textContent = '@page { size: ' + sz + '; margin: 15mm 15mm 15mm 15mm; }';
      document.querySelectorAll('.pcontrols button').forEach(function(b) { b.classList.remove('on'); });
      var el = document.getElementById(btnId); if (el) el.classList.add('on');
    }
  </script>
</head>
<body>

  <!-- Controls -->
  <div class="pcontrols no-print">
    <button id="bf4p" class="on" onclick="setSize('215mm 330mm','bf4p')">F4 Portrait (Folio)</button>
    <button id="ba4p" onclick="setSize('210mm 297mm','ba4p')">A4 Portrait</button>
    <button onclick="window.print()" style="background:#16a34a;color:#fff;border-color:#16a34a;">&#128438; Cetak Dokumen</button>
  </div>

  <div class="doc-page">
    <!-- TITLE HEADER EXACT MATCH TO IMAGE -->
    <div class="title-header">
      <div class="title-main">DAFTAR PEKERJA</div>
      <div class="title-sub">KEGIATAN ${cleanKegiatan}</div>
      <div class="title-loc">${cleanLokasi}</div>
    </div>

    <!-- 2-COLUMN GRID TABLE MATCHING SAMPLE IMAGE -->
    <table class="ktp-grid-table">
      <tbody>
        ${Array.from({ length: Math.ceil(sortedWorkers.length / 2) }).map((_, rowIndex) => {
          const w1 = sortedWorkers[rowIndex * 2];
          const w2 = sortedWorkers[rowIndex * 2 + 1];

          const getLabel = (w: any) => {
            if (!w) return "";
            const role = w.kategori === 'Md' ? 'MANDOR' : w.kategori === 'Tk' ? 'TUKANG' : 'PEKERJA';
            return `${w.nama.toUpperCase()} - ( ${role} )`;
          };

          const getKtpImg = (w: any) => {
            if (!w) return "";
            return w.ktpImgUrl || generateRealisticKtpSvg(w.nik, w.nama, w.gender, cleanLokasi);
          };

          return `
            <tr>
              <td>
                ${w1 ? `
                  <div class="ktp-box">
                    <div class="ktp-img-area">
                      <img src="${getKtpImg(w1)}" alt="KTP ${w1.nama}" />
                    </div>
                    <div class="ktp-label-area">
                      ${getLabel(w1)}
                    </div>
                  </div>
                ` : ''}
              </td>
              <td>
                ${w2 ? `
                  <div class="ktp-box">
                    <div class="ktp-img-area">
                      <img src="${getKtpImg(w2)}" alt="KTP ${w2.nama}" />
                    </div>
                    <div class="ktp-label-area">
                      ${getLabel(w2)}
                    </div>
                  </div>
                ` : ''}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
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
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 font-bold">
              <Fingerprint size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">3. Daftar KTP Pekerja</h1>
              <p className="text-xs text-slate-500">Lampiran Foto KTP Tenaga Kerja Pembangunan Desa (Format Resmi LPJ Kesra)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20"
          >
            <Plus size={16} />
            <span>+ Buat Lampiran KTP Pekerja</span>
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
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
                <th className="px-6 py-4">Jumlah Pekerja</th>
                <th className="px-6 py-4">Status KTP</th>
                <th className="px-6 py-4 text-center">Cetak Lampiran KTP (F4)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Fingerprint size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">Belum ada data lampiran KTP pekerja.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 max-w-xs">
                      <div>{item.kegiatan}</div>
                      <div className="text-xs font-normal text-slate-400">{item.desa}, {item.kecamatan}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{item.lokasiKegiatan}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {item.workers?.length || 0} Orang Pekerja
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 size={13} />
                        <span>KTP Siap Cetak</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handlePrintDocument(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Printer size={14} />
                        <span>Cetak KTP (F4 Grid)</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                          title="Lihat Pratinjau Grid KTP"
                        >
                          <Eye size={14} />
                          <span>Pratinjau KTP</span>
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Edit & Upload Foto KTP"
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
              ? "Tidak ada data lampiran KTP."
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
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
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

      {/* DETAIL / PREVIEW GRID MODAL */}
      {showDetailModal && detailRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold">
                  <Fingerprint size={22} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Pratinjau Cetak Grid KTP Pekerja
                  </h2>
                  <p className="text-xs text-slate-500">
                    Format resmi 2-Kolom LPJ untuk {detailRecord.workers?.length || 0} Tenaga Kerja
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

            {/* PREVIEW CONTAINER */}
            <div className="mt-6 border-2 border-slate-800 p-6 rounded-2xl bg-white space-y-6">
              {/* Header Title */}
              <div className="text-center font-bold font-serif uppercase tracking-wide space-y-1">
                <div className="text-base text-slate-900">DAFTAR PEKERJA</div>
                <div className="text-sm text-slate-900">KEGIATAN {formatNamaKegiatan(detailRecord.kegiatan)}</div>
                <div className="text-sm text-slate-900">{formatLokasiKegiatan(detailRecord.lokasiKegiatan)}</div>
              </div>

              {/* 2-Column Grid Preview */}
              <div className="grid grid-cols-2 gap-0 border-2 border-black rounded-lg overflow-hidden">
                {sortWorkers(detailRecord.workers || []).map((w: any, idx: number) => {
                  const role = w.kategori === 'Md' ? 'MANDOR' : w.kategori === 'Tk' ? 'TUKANG' : 'PEKERJA';
                  const label = `${w.nama.toUpperCase()} - ( ${role} )`;
                  const ktpSrc = w.ktpImgUrl || generateRealisticKtpSvg(w.nik, w.nama, w.gender, formatLokasiKegiatan(detailRecord.lokasiKegiatan));

                  return (
                    <div key={idx} className="border border-black flex flex-col justify-between">
                      <div className="p-3 flex items-center justify-center min-h-[140px] bg-slate-50/50">
                        <img 
                          src={ktpSrc} 
                          alt={`KTP ${w.nama}`} 
                          className="max-h-36 max-w-full rounded border border-slate-300 object-contain"
                        />
                      </div>
                      <div className="border-t-2 border-black p-2 text-center text-xs font-bold font-serif uppercase bg-white">
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => handlePrintDocument(detailRecord)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Printer size={15} />
                <span>Cetak Lampiran KTP (F4 Grid)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL (+ Buat Lampiran KTP / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold">
                  <Fingerprint size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {editingId ? "Edit Lampiran KTP Pekerja" : "Form Pengisian Lampiran KTP Pekerja"}
                  </h2>
                  <p className="text-xs text-slate-500">Kelola foto KTP dan nama label otomatis (NAMA - JABATAN)</p>
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
              {/* SECTION 1: NAMA KEGIATAN (AUTO UPPERCASE) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Nama Kegiatan Pembangunan (Otomatis Kapital/UPPERCASE)
                </label>
                <input 
                  type="text"
                  value={formData.kegiatan}
                  onChange={(e) => setFormData({ ...formData, kegiatan: formatNamaKegiatan(e.target.value) })}
                  placeholder="Contoh: BETONISASI JALAN LINGKUNGAN DAN PELENGKAPNYA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold uppercase text-xs focus:ring-2 focus:ring-rose-500/20"
                  required
                />
              </div>

              {/* SECTION 2: LOKASI KEGIATAN (AUTO KAPITAL & STANDARISASI RT. 004 RW. 001) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Lokasi Kegiatan (Otomatis Kapital & Format Standard RT. 004 RW. 001)
                </label>
                <input 
                  type="text"
                  value={formData.lokasiKegiatan}
                  onChange={(e) => setFormData({ ...formData, lokasiKegiatan: formatLokasiKegiatan(e.target.value) })}
                  placeholder="Contoh: KP. CIMANGGU RT. 004 RW. 001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold uppercase text-xs focus:ring-2 focus:ring-rose-500/20"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Format otomatis merapikan Rt.04 menjadi RT. 004 & Rw.01 menjadi RW. 001</p>
              </div>

              {/* SECTION 3: DAFTAR WORKERS & UPLOAD KTP (AUTO GENERATE LABEL: NAMA - JABATAN) */}
              <div className="bg-rose-50/50 p-4 rounded-2xl space-y-4 border border-rose-100 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} />
                    <span>4. Upload Foto KTP Pekerja (Otomatis Label: NAMA - JABATAN)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddWorkerRow}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/20"
                  >
                    <Plus size={14} />
                    <span>+ Tambah Pekerja</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.workers.map((w, idx) => {
                    const roleName = w.kategori === 'Md' ? 'MANDOR' : w.kategori === 'Tk' ? 'TUKANG' : 'PEKERJA';
                    const autoLabel = `${(w.nama || 'NAMA').toUpperCase()} - ( ${roleName} )`;

                    return (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-rose-700 text-xs flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-[11px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>Label Otomatis Cetak: <span className="underline font-mono">{autoLabel}</span></span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveWorkerRow(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Pekerja"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Nama */}
                          <div className="md:col-span-5">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Lengkap (Otomatis Kapital)</label>
                            <input
                              type="text"
                              value={w.nama}
                              onChange={(e) => handleWorkerChange(idx, "nama", e.target.value)}
                              placeholder="NAMA LENGKAP PEKERJA"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold uppercase text-xs"
                              required
                            />
                          </div>

                          {/* Kategori */}
                          <div className="md:col-span-3">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Jabatan / Kategori</label>
                            <select
                              value={w.kategori}
                              onChange={(e) => handleWorkerChange(idx, "kategori", e.target.value)}
                              className="w-full px-2 py-2 rounded-lg border border-slate-200 font-bold text-xs bg-rose-50 text-rose-800"
                            >
                              <option value="Md">Mandor (Md)</option>
                              <option value="Tk">Tukang (Tk)</option>
                              <option value="Pk">Pekerja (Pk)</option>
                            </select>
                          </div>

                          {/* Upload KTP Image File */}
                          <div className="md:col-span-4">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Upload File Foto KTP</label>
                            <div className="flex items-center gap-2">
                              <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg p-2 text-center flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 transition-colors">
                                <Upload size={14} className="text-rose-600" />
                                <span>{w.ktpImgUrl ? "Ganti KTP" : "Upload KTP"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload(idx, e)}
                                  className="hidden"
                                />
                              </label>

                              {w.ktpImgUrl && (
                                <img 
                                  src={w.ktpImgUrl} 
                                  alt="KTP" 
                                  className="h-9 w-14 object-cover rounded border border-slate-200" 
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Lampiran KTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
