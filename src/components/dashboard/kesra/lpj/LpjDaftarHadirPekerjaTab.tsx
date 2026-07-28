"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Users, 
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
  Building2
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

export function LpjDaftarHadirPekerjaTab({ session }: { session: any }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Lock toggles for header metadata & signatures
  const [isHeaderLocked, setIsHeaderLocked] = useState(true);
  const [isSignaturesLocked, setIsSignaturesLocked] = useState(true);

  // Initial Form Data Schema
  const emptyForm = {
    desa: "CIMANGGU I",
    kecamatan: "CIBUNGBULANG",
    provinsi: "JAWA BARAT",
    kegiatan: "BETONISASI JALAN LINGKUNGAN DAN PELENGKAPNYA",
    lokasiKegiatan: "Kp. Cimanggu Rt. 004 Rw. 001",
    masaKerjaHari: 5,
    tanggalTTD: "2025-04-27",
    kepalaDesa: "HERNAWAN M. SODIK",
    kaurKeuangan: "ENJEN NURDIN",
    sekretarisDesa: "FAJAR TRI APRIANA",
    ketuaTpk: "M. TONNY GUNAWAN",
    workers: [
      { nama: "M. TONNY GUNAWAN", gender: "L", kategori: "Md", isHadir: [true, true, true, true, true] },
      { nama: "Ahmad Subagja", gender: "L", kategori: "Tk", isHadir: [true, true, true, true, true] },
      { nama: "Ujang Iskandar", gender: "L", kategori: "Tk", isHadir: [true, true, true, true, true] },
      { nama: "Ade Saepudin", gender: "L", kategori: "Tk", isHadir: [true, true, true, true, true] },
      { nama: "Iyom Maryono", gender: "L", kategori: "Tk", isHadir: [true, true, true, true, true] },
      { nama: "Siti Rahmawati", gender: "P", kategori: "Pk", isHadir: [true, true, true, true, true] },
      { nama: "Budi Santoso", gender: "L", kategori: "Pk", isHadir: [true, true, true, true, true] },
      { nama: "Agus Pratama", gender: "L", kategori: "Pk", isHadir: [true, true, true, true, true] },
      { nama: "Dede Mulyana", gender: "L", kategori: "Pk", isHadir: [true, true, true, true, true] },
      { nama: "Asep Herman", gender: "L", kategori: "Pk", isHadir: [true, true, true, true, true] },
      { nama: "Endang Suherman", gender: "L", kategori: "Pk", isHadir: [true, true, true, true, true] },
      { nama: "Jaka Tarub", gender: "L", kategori: "Pk", isHadir: [true, true, true, true, true] },
      { nama: "Solihin", gender: "L", kategori: "Pk", isHadir: [true, true, true, true, true] }
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

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data daftar hadir pekerja ini?")) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  // Helper Sort Workers by Mandor (Md) -> Tukang (Tk) -> Pekerja (Pk)
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
          isHadir: Array(prev.masaKerjaHari).fill(true)
        }
      ]
    }));
  };

  // Remove Worker Row
  const handleRemoveWorkerRow = (index: number) => {
    if (formData.workers.length <= 1) {
      alert("Minimal harus ada 1 pekerja dalam daftar hadir!");
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

  // PRINT LANDSCAPE DAFTAR HADIR PEKERJA (PERFECT JK & KATEGORI HORIZONTAL LINE ALIGNMENT, NO EXTRA EMPTY COLUMNS)
  const handlePrintDocument = (record: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sortedWorkers = sortWorkers(record.workers || []);
    const dateColumns = calculateBackwardsDates(record.tanggalTTD, record.masaKerjaHari || 5);

    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Daftar Hadir Pekerja - ${record.kegiatan}</title>
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
      line-height: 1.25;
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
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .title-sub {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-top: 2px;
    }

    /* TOP METADATA 2-COLUMN TABLE */
    .top-meta {
      width: 100%;
      margin-bottom: 10px;
      font-size: 9.5pt;
    }
    .top-meta td {
      vertical-align: top;
      border: none;
      padding: 1.5px 0;
    }

    /* MAIN TABLE WITH CRISP SOLID BLACK BORDERS ALWAYS */
    table.tbl-hadir {
      width: 100%;
      border-collapse: collapse;
      border: 1.5px solid #000;
      margin-bottom: 15px;
    }
    table.tbl-hadir th, table.tbl-hadir td {
      border: 1px solid #000 !important;
      padding: 4px 3px;
      font-size: 8.5pt;
      text-align: center;
      vertical-align: middle;
    }
    table.tbl-hadir th {
      font-weight: bold;
      background-color: #ffffff;
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
      font-size: 9.5pt;
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
      <div class="title-main">DAFTAR HADIR PEKERJA</div>
      <div class="title-sub">KEGIATAN ${record.kegiatan}</div>
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
            <tr><td style="width: 120px;">Kegiatan</td><td>: ${record.kegiatan}</td></tr>
            <tr><td>Lokasi Kegiatan</td><td>: ${record.lokasiKegiatan}</td></tr>
            <tr><td>Masa Kerja</td><td>: ${record.masaKerjaHari} Hari</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- MAIN TABLE DAFTAR HADIR (UNBROKEN PERFECT SINGLE HORIZONTAL LINE FOR L, P, Md, Tk, Pk TOP BORDERS & NO EXTRA EMPTY COLUMNS) -->
    <table class="tbl-hadir">
      <thead>
        <tr>
          <th style="width: 35px;" rowspan="3">No</th>
          <th style="width: 250px;" rowspan="3">Nama</th>
          <th colspan="2">JK</th>
          <th colspan="3">Kategori</th>
          <th colspan="${dateColumns.length}">Hari-Orang-Kerja (HOK)<br>Menurut Tanggal</th>
        </tr>
        <tr>
          <th style="width: 22px;" rowspan="2">L</th>
          <th style="width: 22px;" rowspan="2">P</th>
          <th style="width: 28px;" rowspan="2">Md</th>
          <th style="width: 28px;" rowspan="2">Tk</th>
          <th style="width: 28px;" rowspan="2">Pk</th>
          ${dateColumns.map(d => `
            <th style="font-size: 8.5pt; padding: 3px 2px;">${d.dayIndex}</th>
          `).join('')}
        </tr>
        <tr>
          ${dateColumns.map(d => `
            <th style="font-size: 7.5pt; font-weight: normal; padding: 2px 1px;">${d.dateStr}</th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        ${sortedWorkers.map((w: any, idx: number) => `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td style="text-align: left; padding-left: 10px;">${w.nama}</td>
            <td style="text-align: center;">${w.gender === 'L' ? '√' : ''}</td>
            <td style="text-align: center;">${w.gender === 'P' ? '√' : ''}</td>
            <td style="text-align: center;">${w.kategori === 'Md' ? '√' : ''}</td>
            <td style="text-align: center;">${w.kategori === 'Tk' ? '√' : ''}</td>
            <td style="text-align: center;">${w.kategori === 'Pk' ? '√' : ''}</td>
            ${dateColumns.map((_, dayIdx) => `
              <td style="text-align: center;">${(w.isHadir && w.isHadir[dayIdx] !== false) ? '√' : ''}</td>
            `).join('')}
          </tr>
        `).join('')}
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
          Dibayar Lunas<br>
          Kaur Keuangan Desa Cimanggu I<br><br><br><br><br>
          <u><b>${record.kaurKeuangan}</b></u>
        </td>
        <td>
          Telah diverifikasi<br>
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
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 font-bold">
              <Users size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">3. Daftar Hadir Pekerja (LPJ Kesra)</h1>
              <p className="text-xs text-slate-500">Formulir & Rekapitulasi Absensi Harian Tenaga Kerja Pembangunan Desa</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20"
          >
            <Plus size={16} />
            <span>+ Buat Daftar Hadir Pekerja</span>
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
                <th className="px-6 py-4">Masa Kerja</th>
                <th className="px-6 py-4">Jumlah Tenaga Kerja</th>
                <th className="px-6 py-4">Tgl Dokumen</th>
                <th className="px-6 py-4 text-center">Cetak (Landscape F4)</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">Belum ada data daftar hadir pekerja.</p>
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
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                        {item.masaKerjaHari} Hari Kerja
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-700">
                      {item.workers?.length || 0} Orang Pekerja
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-semibold">
                      {formatDateIndo(item.tanggalTTD)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handlePrintDocument(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Printer size={14} />
                        <span>Cetak Absensi (F4)</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
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
              ? "Tidak ada data hadir pekerja."
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

      {/* FORM MODAL (+ Buat Daftar Hadir Pekerja / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold">
                  <Users size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {editingId ? "Edit Daftar Hadir Pekerja" : "Form Pengisian Daftar Hadir Pekerja"}
                  </h2>
                  <p className="text-xs text-slate-500">Kelola rincian absensi harian dan penandatanganan dokumen resmi LPJ</p>
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
              {/* SECTION 1: DESA, KECAMATAN, PROVINSI (WITH LOCK TOGGLE) */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={16} />
                    <span>1. Identitas Wilayah Desa</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsHeaderLocked(!isHeaderLocked)}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
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
                    placeholder="Contoh: BETONISASI JALAN LINGKUNGAN DAN PELENGKAPNYA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold uppercase text-xs focus:ring-2 focus:ring-rose-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. Lokasi Kegiatan</label>
                  <input 
                    type="text"
                    value={formData.lokasiKegiatan}
                    onChange={(e) => setFormData({ ...formData, lokasiKegiatan: e.target.value })}
                    placeholder="Contoh: Kp. Cimanggu Rt. 004 Rw. 001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs focus:ring-2 focus:ring-rose-500/20"
                    required
                  />
                </div>
              </div>

              {/* SECTION 4: MASA KERJA & TANGGAL DOKUMEN (HITUNG MUNDUR AUTOMATIC) */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100 text-xs">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} />
                  <span>4 & 5. Masa Kerja & Tanggal Dokumen (Hitung Mundur Otomatis)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Masa Kerja (Jumlah Hari)</label>
                    <input 
                      type="number"
                      min={1}
                      max={20}
                      value={formData.masaKerjaHari}
                      onChange={(e) => setFormData({ ...formData, masaKerjaHari: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Mengatur jumlah kolom tanggal aktif pada tabel absensi</p>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Dokumen TTD (Hitung Mundur)</label>
                    <input 
                      type="date"
                      value={formData.tanggalTTD}
                      onChange={(e) => setFormData({ ...formData, tanggalTTD: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs"
                      required
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Tanggal ini menjadi hari terakhir (Hari ke-{formData.masaKerjaHari})</p>
                  </div>
                </div>
              </div>

              {/* SECTION 5 & 6: PENGISIAN TENAGA KERJA (DYNAMIC SORTED MANDOR -> TUKANG -> PEKERJA) */}
              <div className="bg-rose-50/50 p-4 rounded-2xl space-y-4 border border-rose-100 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} />
                    <span>6. Daftar Tenaga Kerja (Otomatis Diurutkan: Mandor → Tukang → Pekerja)</span>
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

                <div className="space-y-3">
                  {formData.workers.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
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
                      <div className="w-20">
                        <select
                          value={w.gender}
                          onChange={(e) => handleWorkerChange(idx, "gender", e.target.value)}
                          className="w-full px-2 py-2 rounded-lg border border-slate-200 font-bold text-xs text-center"
                        >
                          <option value="L">L (Laki-laki)</option>
                          <option value="P">P (Perempuan)</option>
                        </select>
                      </div>

                      {/* Kategori */}
                      <div className="w-32">
                        <select
                          value={w.kategori}
                          onChange={(e) => handleWorkerChange(idx, "kategori", e.target.value)}
                          className="w-full px-2 py-2 rounded-lg border border-slate-200 font-bold text-xs text-center bg-rose-50 text-rose-800"
                        >
                          <option value="Md">Md (Mandor)</option>
                          <option value="Tk">Tk (Tukang)</option>
                          <option value="Pk">Pk (Pekerja)</option>
                        </select>
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
                  ))}
                </div>
              </div>

              {/* SECTION 7: PENANDATANGAN 4 PEJABAT (WITH LOCK TOGGLE) */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} />
                    <span>7. Penandatanganan Dokumen (4 Pejabat TPK & Desa)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSignaturesLocked(!isSignaturesLocked)}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
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
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Daftar Hadir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
