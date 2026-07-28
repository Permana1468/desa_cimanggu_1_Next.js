"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  FileCheck, 
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
  CheckCircle2,
  Building2,
  Calendar,
  UserCheck
} from "lucide-react";

// --- TERBILANG HELPER FOR DATE TO WORDS ---
function angkaKeTerbilang(n: number): string {
  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  if (n < 0) return "";
  if (n < 12) return satuan[n];
  if (n < 20) return (satuan[n - 10] + " Belas").trim();
  if (n < 100) return (satuan[Math.floor(n / 10)] + " Puluh " + satuan[n % 10]).trim();
  if (n < 200) return ("Seratus " + angkaKeTerbilang(n - 100)).trim();
  if (n < 1000) return (satuan[Math.floor(n / 100)] + " Ratus " + angkaKeTerbilang(n % 100)).trim();
  if (n < 2000) return ("Seribu " + angkaKeTerbilang(n - 1000)).trim();
  if (n < 1000000) return (angkaKeTerbilang(Math.floor(n / 1000)) + " Ribu " + angkaKeTerbilang(n % 1000)).trim();
  return n.toString();
}

function dateToTerbilangFull(dateStr: string): { hari: string; tanggalWords: string; bulanWords: string; tahunWords: string } {
  if (!dateStr) return { hari: "Selasa", tanggalWords: "Dua", bulanWords: "Juni", tahunWords: "Dua Ribu Dua Puluh Enam" };
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { hari: "Selasa", tanggalWords: "Dua", bulanWords: "Juni", tahunWords: "Dua Ribu Dua Puluh Enam" };
  }

  const HARI_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const BULAN_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  
  const hari = HARI_ID[d.getDay()] || "Selasa";
  const tgl = d.getDate();
  const bln = BULAN_ID[d.getMonth()] || "Juni";
  const thn = d.getFullYear();

  return {
    hari,
    tanggalWords: angkaKeTerbilang(tgl),
    bulanWords: bln,
    tahunWords: angkaKeTerbilang(thn)
  };
}

export function LpjBastPekerjaanTab({ session }: { session: any }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Lock state for Pihak Kesatu (Nama Kepala Desa)
  const [isPihakKesatuLocked, setIsPihakKesatuLocked] = useState(true);

  // Default Form Schema
  const emptyForm = {
    judulInfrastruktur: "PEMBANGUNAN INFRASTRUKTUR PERDESAAN",
    sumberDanaTahun: "BANTUAN KEUANGAN DANA DESA (DD) TAHUN 2026",
    sumberDanaSingkat: "Dana Desa (DD) Tahun 2026",
    namaKegiatan: "REHAB POSYANDU MAWAR V",
    tanggalBast: "2026-06-02",
    pihakKesatuNama: "HERNAWAN M. SODIK",
    pihakKesatuJabatan: "Kepala Desa Cimanggu I",
    pihakKeduaNama: "ABDUL AZIZ",
    pihakKeduaJabatan: "Ketua TPK Desa Cimanggu I",
    pihakKeduaAlamat: "Kp. Ciaruteun Rt. 001/008",
    kegiatanTabel: "Rehab Posyandu Mawar V",
    volumeTabel: "1 Unit",
    lokasiTabel: "Kp. Jatake Rt. 004/005 Desa Cimanggu I",
    capaianTabel: "100 %"
  };

  const [formData, setFormData] = useState(emptyForm);

  // Load saved default Pihak Kesatu
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKesatu = localStorage.getItem("lpj_pihak_kesatu_nama");
      if (savedKesatu) {
        setFormData(prev => ({ ...prev, pihakKesatuNama: savedKesatu }));
      }
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
      item.namaKegiatan.toLowerCase().includes(search.toLowerCase()) ||
      item.pihakKeduaNama.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasiTabel.toLowerCase().includes(search.toLowerCase())
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
    if (confirm("Apakah Anda yakin ingin menghapus Berita Acara Serah Terima (BAST) Pekerjaan ini?")) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaKegiatan || !formData.pihakKeduaNama) {
      alert("Mohon lengkapi Nama Kegiatan dan Nama Pihak Kedua!");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("lpj_pihak_kesatu_nama", formData.pihakKesatuNama);
    }

    if (editingId) {
      setData(prev => prev.map(d => d.id === editingId ? { ...formData, id: editingId } : d));
    } else {
      const newItem = {
        ...formData,
        id: Date.now().toString()
      };
      setData(prev => [newItem, ...prev]);
    }
    setShowModal(false);
  };

  // --- PRINT FUNCTIONALITY (100% EXACT FORMAT MATCH TO IMAGE) ---
  const handlePrint = (item: any) => {
    const terbilangDate = dateToTerbilangFull(item.tanggalBast);
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>BAST Pekerjaan - ${item.namaKegiatan}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      color: #000;
      background: #fff;
      line-height: 1.4;
    }

    /* FOLIO / F4 PORTRAIT PAGE */
    @page {
      size: 215mm 330mm;
      margin: 18mm 20mm 18mm 20mm;
    }

    .doc-page {
      width: 100%;
      box-sizing: border-box;
      padding: 0;
      position: relative;
    }

    /* KOP SURAT BAST */
    .kop-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 85px;
      margin-bottom: 2px;
    }
    .kop-logo {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 80px;
      width: auto;
      object-fit: contain;
    }
    .kop-text-box {
      text-align: center;
      width: 100%;
      padding-left: 85px;
      padding-right: 10px;
    }
    .kop-title-1 {
      font-size: 15pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      line-height: 1.15;
      font-family: Arial, Helvetica, sans-serif;
      text-transform: uppercase;
    }
    .kop-title-2 {
      font-size: 15pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      line-height: 1.15;
      font-family: Arial, Helvetica, sans-serif;
      text-transform: uppercase;
    }
    .kop-title-3 {
      font-size: 17pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      line-height: 1.2;
      font-family: Arial, Helvetica, sans-serif;
      text-transform: uppercase;
    }
    .kop-subtitle {
      font-size: 9.5pt;
      font-style: italic;
      margin-top: 3px;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 500;
      text-decoration: underline;
    }
    .double-line {
      border-bottom: 3.5px solid #000;
      margin-top: 5px;
      margin-bottom: 18px;
    }

    /* BAST TITLE BLOCK */
    .bast-title-block {
      text-align: center;
      margin-bottom: 20px;
      font-family: Arial, Helvetica, sans-serif;
    }
    .bast-main-title {
      font-size: 13pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      line-height: 1.3;
      text-transform: uppercase;
    }
    .bast-sub-title-1 {
      font-size: 12.5pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      line-height: 1.3;
      text-transform: uppercase;
    }
    .bast-sub-title-2 {
      font-size: 12.5pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      line-height: 1.3;
      text-transform: uppercase;
    }
    .bast-kegiatan-title {
      font-size: 12.5pt;
      font-weight: 900;
      letter-spacing: 0.5px;
      line-height: 1.3;
      text-transform: uppercase;
    }

    /* BODY PARAGRAPHS */
    .opening-p {
      text-align: justify;
      margin-bottom: 14px;
      line-height: 1.45;
      font-size: 11pt;
    }

    /* PIHAK LIST */
    .pihak-list {
      margin-left: 15px;
      margin-bottom: 16px;
    }
    .pihak-item {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      text-align: justify;
      line-height: 1.45;
      font-size: 11pt;
    }
    .pihak-num {
      font-weight: bold;
      min-width: 18px;
    }
    .pihak-body {
      flex: 1;
    }
    .pihak-name {
      font-weight: 900;
      font-size: 11.5pt;
      text-transform: uppercase;
    }

    .menyatakan-block {
      margin-top: 14px;
      margin-bottom: 14px;
    }
    .menyatakan-title {
      font-size: 11pt;
      margin-bottom: 10px;
    }

    .menyatakan-item {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      text-align: justify;
      line-height: 1.45;
      font-size: 11pt;
    }

    /* TABLE WORK RECAP */
    .tbl-bast-recap {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      border: 1.5px solid #000;
    }
    .tbl-bast-recap th, .tbl-bast-recap td {
      border: 1.5px solid #000;
      padding: 7px 10px;
      font-size: 10.5pt;
      font-family: Arial, Helvetica, sans-serif;
    }
    .tbl-bast-recap th {
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
      background-color: #fff;
    }

    .closing-p {
      text-align: justify;
      margin-top: 16px;
      margin-bottom: 30px;
      font-size: 11pt;
    }

    /* SIGNATURE BLOCK */
    .sig-table {
      width: 100%;
      border: none;
      margin-top: 20px;
    }
    .sig-table td {
      border: none;
      vertical-align: top;
      text-align: center;
      font-size: 11pt;
      font-family: Arial, Helvetica, sans-serif;
    }
    .sig-title {
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 75px;
    }
    .sig-name {
      font-weight: 900;
      text-decoration: underline;
      text-transform: uppercase;
      font-size: 11.5pt;
    }
    .sig-role {
      font-size: 10.5pt;
      margin-top: 2px;
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
      padding: 6px 14px;
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
    @page { size: 215mm 330mm; margin: 18mm 20mm 18mm 20mm; }
  </style>

  <script>
    function setSize(sz, btnId) {
      document.getElementById('pgstyle').textContent = '@page { size: ' + sz + '; margin: 18mm 20mm 18mm 20mm; }';
      document.querySelectorAll('.pcontrols button').forEach(function(b) { b.classList.remove('on'); });
      var el = document.getElementById(btnId); if (el) el.classList.add('on');
    }
  </script>
</head>
<body>

  <!-- Controls -->
  <div class="pcontrols no-print">
    <button id="bf4p" class="on" onclick="setSize('215mm 330mm','bf4p')">F4 Potrait (Folio)</button>
    <button id="ba4p" onclick="setSize('A4 portrait','ba4p')">A4 Potrait</button>
    <button onclick="window.print()" style="background:#16a34a;color:#fff;border-color:#16a34a;">&#128438; Cetak BAST Pekerjaan</button>
  </div>

  <div class="doc-page">
    <!-- KOP SURAT BAST -->
    <div class="kop-container">
      <img src="${origin}/images/logo-bogor.png" class="kop-logo" alt="Logo Kab Bogor" />
      <div class="kop-text-box">
        <div class="kop-title-1">PEMERINTAH KABUPATEN BOGOR</div>
        <div class="kop-title-2">KECAMATAN CIBUNGBULANG</div>
        <div class="kop-title-3">DESA CIMANGGU I</div>
        <div class="kop-subtitle">Jl. Raya Gardu Seri Kp. Ciaruteun Rt.004 Rw.008 Desa Cimanggu I Kec. Cibungbulang Kab. Bogor - 16630</div>
      </div>
    </div>
    <div class="double-line"></div>

    <!-- DOCUMENT TITLE -->
    <div class="bast-title-block">
      <div class="bast-main-title">BERITA ACARA SERAH TERIMA PEKERJAAN</div>
      <div class="bast-sub-title-1">${item.judulInfrastruktur}</div>
      <div class="bast-sub-title-2">${item.sumberDanaTahun}</div>
      <div class="bast-kegiatan-title">KEGIATAN ${item.namaKegiatan}</div>
    </div>

    <!-- OPENING PARAGRAPH -->
    <p class="opening-p">
      Pada hari ini &nbsp;<b>${terbilangDate.hari}</b>&nbsp; tanggal &nbsp;<b>${terbilangDate.tanggalWords}</b>&nbsp; bulan &nbsp;<b>${terbilangDate.bulanWords}</b>&nbsp; tahun &nbsp;<b>${terbilangDate.tahunWords}</b>, kami yang bertanda tangan dibawah ini :
    </p>

    <!-- PIHAK LIST -->
    <div class="pihak-list">
      <div class="pihak-item">
        <div class="pihak-num">1.</div>
        <div class="pihak-body">
          <div class="pihak-name">${item.pihakKesatuNama}</div>
          <div>Selaku Kepala Desa Cimanggu I Kecamatan Cibungbulang dalam hal ini bertindak untuk dan atas nama Pemerintah Desa Cimanggu I yang selanjutnya disebut sebagai <b>PIHAK KESATU</b>.</div>
        </div>
      </div>

      <div class="pihak-item">
        <div class="pihak-num">2.</div>
        <div class="pihak-body">
          <div class="pihak-name">${item.pihakKeduaNama}</div>
          <div>Selaku Ketua TPK Desa Cimanggu I Kecamatan Cibungbulang dalam hal ini bertindak untuk dan atas nama TPK Desa Cimanggu I Kecamatan Cibungbulang yang beralamat di Jln. Gardu Seri ${item.pihakKeduaAlamat} Desa Cimanggu I, yang selanjutnya disebut <b>PIHAK KEDUA</b>.</div>
        </div>
      </div>
    </div>

    <!-- MENYATAKAN BAHWA -->
    <div class="menyatakan-block">
      <div class="menyatakan-title">Menyatakan bahwa :</div>

      <div class="menyatakan-item">
        <div class="pihak-num">1.</div>
        <div class="pihak-body">
          <b>PIHAK KEDUA</b> telah menyelesaikan pekerjaan kegiatan Pembangunan Infrastruktur Perdesaan yang bersumber dari ${item.sumberDanaSingkat || item.sumberDanaTahun} untuk Desa Cimanggu I Sesuai dengan Surat Perintah Tugas dan rencana pelaksanaan pekerjaan / RAB, kegiatan :
        </div>
      </div>

      <!-- TABEL REKAPITULASI KEGIATAN -->
      <table class="tbl-bast-recap">
        <thead>
          <tr>
            <th style="width: 8%;">NO</th>
            <th style="width: 37%;">KEGIATAN</th>
            <th style="width: 17%;">VOLUME</th>
            <th style="width: 26%;">LOKASI</th>
            <th style="width: 12%;">CAPAIAN PELAKSANAAN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center;">1</td>
            <td style="text-align: left;">${item.kegiatanTabel || item.namaKegiatan}</td>
            <td style="text-align: center;">${item.volumeTabel}</td>
            <td style="text-align: left;">${item.lokasiTabel}</td>
            <td style="text-align: center; font-weight: bold;">${item.capaianTabel}</td>
          </tr>
        </tbody>
      </table>

      <div class="menyatakan-item" style="margin-top: 10px;">
        <div class="pihak-num">2.</div>
        <div class="pihak-body">
          <b>PIHAK KESATU</b> telah menerima dengan baik hasil pelaksanaan pekerjaan / kegiatan Pembangunan tersebut
        </div>
      </div>
    </div>

    <!-- CLOSING -->
    <p class="closing-p">
      Demikian Berita Acara ini dibuat untuk digunakan sebagaimana mestinya.
    </p>

    <!-- SIGNATURES -->
    <table class="sig-table">
      <tr>
        <td style="width: 50%;">
          <div class="sig-title">PIHAK KESATU</div>
          <div class="sig-name">${item.pihakKesatuNama}</div>
          <div class="sig-role">${item.pihakKesatuJabatan}</div>
        </td>
        <td style="width: 50%;">
          <div class="sig-title">PIHAK KEDUA</div>
          <div class="sig-name">${item.pihakKeduaNama}</div>
          <div class="sig-role">Ketua TPK</div>
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
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <FileCheck size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">6. BAST Pekerjaan (LPJ Kesra)</h1>
            <p className="text-xs text-slate-500">Berita Acara Serah Terima Pekerjaan Pembangunan Infrastruktur Perdesaan (Format Resmi)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>Tambah BAST Pekerjaan</span>
          </button>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari BAST / Kegiatan / Pihak..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500">Tampilkan:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const val = e.target.value;
              setItemsPerPage(val === "ALL" ? "ALL" : Number(val));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-rose-500 bg-white"
          >
            <option value={10}>10 Baris</option>
            <option value={25}>25 Baris</option>
            <option value={50}>50 Baris</option>
            <option value="ALL">Semua ({totalItems})</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">No</th>
                <th className="px-6 py-4">Nama Kegiatan</th>
                <th className="px-6 py-4">Pihak Kesatu (Kades)</th>
                <th className="px-6 py-4">Pihak Kedua (TPK)</th>
                <th className="px-6 py-4">Lokasi & Volume</th>
                <th className="px-6 py-4 text-center">Tanggal BAST</th>
                <th className="px-6 py-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data Berita Acara Serah Terima Pekerjaan.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-center font-bold">
                      {itemsPerPage === "ALL" ? idx + 1 : (currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{item.namaKegiatan}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.sumberDanaTahun}</div>
                    </td>
                    <td className="px-6 py-4">{item.pihakKesatuNama}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{item.pihakKeduaNama}</div>
                      <div className="text-[10px] text-slate-400">{item.pihakKeduaAlamat}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{item.lokasiTabel}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Vol: {item.volumeTabel} ({item.capaianTabel})</div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">{item.tanggalBast}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handlePrint(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Cetak Dokumen BAST"
                        >
                          <Printer size={13} />
                          <span>Cetak</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Data"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Data"
                        >
                          <Trash2 size={15} />
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
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            {totalItems === 0
              ? "Tidak ada data BAST pekerjaan."
              : itemsPerPage === "ALL"
                ? `Menampilkan seluruh ${totalItems} BAST pekerjaan.`
                : `Menampilkan ${(currentPage - 1) * (itemsPerPage as number) + 1} - ${Math.min(currentPage * (itemsPerPage as number), totalItems)} dari ${totalItems} BAST.`}
          </div>

          {itemsPerPage !== "ALL" && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FORM MODAL BAST PEKERJAAN */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {editingId ? "Edit BAST Pekerjaan" : "Tambah BAST Pekerjaan Baru"}
                  </h3>
                  <p className="text-xs text-slate-400">Formulir Berita Acara Serah Terima Pekerjaan Pembangunan Perdesaan</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* SECTION 1: PEMBANGUNAN INFRASTRUKTUR PERDESAAN */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600 border-b pb-1 flex items-center gap-2">
                  <Building2 size={14} /> 1. PEMBANGUNAN INFRASTRUKTUR PERDESAAN & KEGIATAN
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Pembangunan Infrastruktur</label>
                    <input
                      type="text"
                      value={formData.judulInfrastruktur}
                      onChange={(e) => setFormData({ ...formData, judulInfrastruktur: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                      placeholder="misal: PEMBANGUNAN INFRASTRUKTUR PERDESAAN"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan (Otomatis Kapital)</label>
                    <input
                      type="text"
                      value={formData.namaKegiatan}
                      onChange={(e) => setFormData({ ...formData, namaKegiatan: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold uppercase focus:outline-none focus:border-rose-500"
                      placeholder="misal: REHAB POSYANDU MAWAR V"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sumber Dana & Tahun (Judul Header)</label>
                    <input
                      type="text"
                      value={formData.sumberDanaTahun}
                      onChange={(e) => setFormData({ ...formData, sumberDanaTahun: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                      placeholder="misal: BANTUAN KEUANGAN DANA DESA (DD) TAHUN 2026"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sumber Dana Singkat (Kalimat Paragraf)</label>
                    <input
                      type="text"
                      value={formData.sumberDanaSingkat}
                      onChange={(e) => setFormData({ ...formData, sumberDanaSingkat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                      placeholder="misal: Dana Desa (DD) Tahun 2026"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: KALENDER TANGGAL (PADA HARI INI - OTOMATIS TERBILANG HURUF) */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600 border-b pb-1 flex items-center gap-2">
                  <Calendar size={14} /> 2. PADA HARI INI (KALENDER ISIAN &rarr; HASIL OTOMATIS TERBILANG HURUF)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilih Tanggal BAST (Kalender)</label>
                    <input
                      type="date"
                      value={formData.tanggalBast}
                      onChange={(e) => setFormData({ ...formData, tanggalBast: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <span className="block text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1">Pratinjau Terbilang Huruf Otomatis:</span>
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      &quot;Pada hari ini {dateToTerbilangFull(formData.tanggalBast).hari} tanggal {dateToTerbilangFull(formData.tanggalBast).tanggalWords} bulan {dateToTerbilangFull(formData.tanggalBast).bulanWords} tahun {dateToTerbilangFull(formData.tanggalBast).tahunWords}&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PIHAK KESATU & KEDUA */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600 border-b pb-1 flex items-center gap-2">
                  <UserCheck size={14} /> 3 & 4. PIHAK KESATU (KADES + TOMBOL KUNCI) & PIHAK KEDUA (TPK)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Pihak Kesatu (Kades) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">3. Nama Lengkap Pihak Kesatu (Kades)</label>
                      <button
                        type="button"
                        onClick={() => setIsPihakKesatuLocked(!isPihakKesatuLocked)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                          isPihakKesatuLocked ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isPihakKesatuLocked ? <Lock size={10} /> : <Unlock size={10} />}
                        <span>{isPihakKesatuLocked ? "Terkunci" : "Buka Kunci"}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.pihakKesatuNama}
                      disabled={isPihakKesatuLocked}
                      onChange={(e) => setFormData({ ...formData, pihakKesatuNama: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase focus:outline-none focus:border-rose-500 disabled:bg-slate-100 text-slate-700"
                    />
                  </div>

                  {/* Pihak Kedua (TPK) */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">4. Nama Lengkap Pihak Kedua (Ketua TPK)</label>
                    <input
                      type="text"
                      value={formData.pihakKeduaNama}
                      onChange={(e) => setFormData({ ...formData, pihakKeduaNama: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase focus:outline-none focus:border-rose-500"
                      placeholder="misal: ABDUL AZIZ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alamat Pihak Kedua (Cukup Kp. Ciaruteun Rt. 001/008)</label>
                    <input
                      type="text"
                      value={formData.pihakKeduaAlamat}
                      onChange={(e) => setFormData({ ...formData, pihakKeduaAlamat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                      placeholder="Kp. Ciaruteun Rt. 001/008"
                    />
                    <span className="text-[10px] text-slate-400 italic">Otomatis menyatu: &quot;beralamat di Jln. Gardu Seri {formData.pihakKeduaAlamat} Desa Cimanggu I&quot;</span>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan Pihak Kesatu</label>
                    <input
                      type="text"
                      value={formData.pihakKesatuJabatan}
                      onChange={(e) => setFormData({ ...formData, pihakKesatuJabatan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: ISIAN TABEL REKAPITULASI (VOLUME, LOKASI & CAPAIAN) */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600 border-b pb-1 flex items-center gap-2">
                  <CheckCircle2 size={14} /> 5. MENYATAKAN BAHWA (ISIAN TABEL REKAPITULASI WORK)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kegiatan Tabel</label>
                    <input
                      type="text"
                      value={formData.kegiatanTabel}
                      onChange={(e) => setFormData({ ...formData, kegiatanTabel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                      placeholder="misal: Rehab Posyandu Mawar V"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Isian Volume</label>
                    <input
                      type="text"
                      value={formData.volumeTabel}
                      onChange={(e) => setFormData({ ...formData, volumeTabel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                      placeholder="misal: 1 Unit"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Isian Lokasi</label>
                    <input
                      type="text"
                      value={formData.lokasiTabel}
                      onChange={(e) => setFormData({ ...formData, lokasiTabel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-rose-500"
                      placeholder="misal: Kp. Jatake Rt. 004/005 Desa Cimanggu I"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-600/20"
                >
                  Simpan Data BAST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
