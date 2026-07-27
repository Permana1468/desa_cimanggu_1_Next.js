"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  ShoppingBag, 
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
  PackageCheck,
  Building2
} from "lucide-react";

// --- TERBILANG HELPER FOR DATE TO WORDS ---
function angkaKeTerbilang(n: number): string {
  const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  if (n < 0) return "";
  if (n < 12) return satuan[n];
  if (n < 20) return satuan[n - 10] + " belas";
  if (n < 100) return (satuan[Math.floor(n / 10)] + " puluh " + satuan[n % 10]).trim();
  if (n < 200) return ("seratus " + angkaKeTerbilang(n - 100)).trim();
  if (n < 1000) return (satuan[Math.floor(n / 100)] + " ratus " + angkaKeTerbilang(n % 100)).trim();
  if (n < 2000) return ("seribu " + angkaKeTerbilang(n - 1000)).trim();
  if (n < 1000000) return (angkaKeTerbilang(Math.floor(n / 1000)) + " ribu " + angkaKeTerbilang(n % 1000)).trim();
  return n.toString();
}

function dateToTerbilangFull(dateStr: string): { hari: string; tanggalWords: string; bulanWords: string; tahunWords: string } {
  if (!dateStr) return { hari: "kamis", tanggalWords: "dua puluh tujuh", bulanWords: "juni", tahunWords: "dua ribu dua puluh empat" };
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { hari: "kamis", tanggalWords: "dua puluh tujuh", bulanWords: "juni", tahunWords: "dua ribu dua puluh empat" };
  }

  const HARI_ID = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  const BULAN_ID = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
  
  const hari = HARI_ID[d.getDay()] || "kamis";
  const tgl = d.getDate();
  const bln = BULAN_ID[d.getMonth()] || "juni";
  const thn = d.getFullYear();

  return {
    hari,
    tanggalWords: angkaKeTerbilang(tgl),
    bulanWords: bln,
    tahunWords: angkaKeTerbilang(thn)
  };
}

function formatDateIndo(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const BULAN_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export function LpjPesananBarangTab({ session }: { session: any }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Master options
  const [tokoOptions] = useState<string[]>([
    "DELIMA JAYA",
    "PB. ABBIE ARDAN",
    "TB. CIMANGGU JAYA",
    "TB. MAJU BERSAMA"
  ]);

  const [sumberDanaOptions] = useState<string[]>([
    "Dana Desa (DD)",
    "Bantuan Keuangan Infrastruktur Provinsi (BANPROV)",
    "Bantuan Keuangan Khusus Akselerasi Pembangunan Perdesaan"
  ]);

  // Lock state for Nama Ketua TPK
  const [isNamaKetuaLocked, setIsNamaKetuaLocked] = useState(true);

  // Initial Form Data Schema
  const emptyForm = {
    nomorRegister: "007/TPK/VI/2024",
    nomorBap: "008/TPK/VI/2024",
    nomorBast: "009/TPK/VI/2024",
    tanggalPesanan: "2024-06-24",
    toko: "DELIMA JAYA",
    sumberDana: "Dana Desa (DD)",
    namaKegiatanSampaiLokasi: "Betonisasi Jalan Lingkungan di Kp. Cimanggu Rt. 004 Rw. 001 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor",
    pengirimanHari: "Kamis",
    pengirimanTanggal: "2024-06-27",
    pengirimanJam: "08.00 Wib",
    namaKetuaTPK: "M. TONNY GUNAWAN",
    namaPemilikToko: "YANTO SETIAWAN",
    pemeriksa1: "ADE SAEPUDIN",
    pemeriksa2: "M. TONNY GUNAWAN",
    pemeriksa3: "IYOM MARYONO",
    items: [
      { banyaknya: "9", satuan: "M3", namaBarang: "Pasir Beton" },
      { banyaknya: "9", satuan: "M3", namaBarang: "Batu Splite 2/3" },
      { banyaknya: "62", satuan: "Zak", namaBarang: "Semen PC (50 Kg)" },
      { banyaknya: "4", satuan: "M3", namaBarang: "Sirtu" },
      { banyaknya: "13", satuan: "Btg", namaBarang: "Kayu Kaso 4/6" },
      { banyaknya: "27", satuan: "Btg", namaBarang: "Papan Cor" },
      { banyaknya: "3", satuan: "Kg", namaBarang: "Paku Campur" },
      { banyaknya: "2", satuan: "Bh", namaBarang: "Cangkul" },
      { banyaknya: "2", satuan: "Bh", namaBarang: "Sendok Tembok" },
      { banyaknya: "1", satuan: "Bh", namaBarang: "Meteran" },
      { banyaknya: "5", satuan: "Bh", namaBarang: "Ember" },
      { banyaknya: "4", satuan: "Bh", namaBarang: "Benang" },
      { banyaknya: "3", satuan: "Bh", namaBarang: "Pengki" }
    ]
  };

  const [formData, setFormData] = useState(emptyForm);

  // Load saved default chairman name
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("lpj_nama_ketua_tpk");
      if (savedName) {
        setFormData(prev => ({ ...prev, namaKetuaTPK: savedName }));
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
      item.nomorRegister.toLowerCase().includes(search.toLowerCase()) ||
      item.toko.toLowerCase().includes(search.toLowerCase()) ||
      item.namaKegiatanSampaiLokasi.toLowerCase().includes(search.toLowerCase())
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
    if (confirm("Apakah Anda yakin ingin menghapus data pesanan barang ini?")) {
      setData(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomorRegister || !formData.toko || !formData.namaKegiatanSampaiLokasi) {
      alert("Mohon lengkapi kolom Nomor Register, Toko, dan Nama Kegiatan!");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("lpj_nama_ketua_tpk", formData.namaKetuaTPK);
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

  // Add Item Row in Form
  const handleAddItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { banyaknya: "1", satuan: "Bh", namaBarang: "" }]
    }));
  };

  // Remove Item Row in Form
  const handleRemoveItemRow = (index: number) => {
    if (formData.items.length <= 1) {
      alert("Minimal harus ada 1 barang dalam daftar pesanan!");
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index)
    }));
  };

  // Update Item Row Field
  const handleItemChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // PRINT 3-DOCUMENT BUNDLE GENERATOR (PERFECT F4 / FOLIO SIZE - 100% PRECISE MATCH)
  const handlePrintBundle = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const terbilangBap = dateToTerbilangFull(order.pengirimanTanggal || order.tanggalPesanan);

    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Paket LPJ Pesanan Barang - ${order.nomorRegister}</title>
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
      line-height: 1.3;
    }

    /* DEFAULT F4 / FOLIO PORTRAIT STANDARD IN INDONESIA (215mm x 330mm) */
    @page {
      size: 215mm 330mm;
      margin: 10mm 15mm 10mm 15mm;
    }

    .doc-page {
      width: 100%;
      box-sizing: border-box;
      padding: 0;
      page-break-after: always;
      break-after: page;
      position: relative;
    }

    /* KOP SURAT */
    .kop-header {
      text-align: center;
      margin-bottom: 2px;
    }
    .kop-title-1 {
      font-size: 13.5pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .kop-title-2 {
      font-size: 13.5pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .kop-title-3 {
      font-size: 12.5pt;
      font-weight: bold;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    .kop-subtitle {
      font-size: 8.5pt;
      font-style: italic;
      margin-top: 2px;
      line-height: 1.2;
    }
    .double-line {
      border-bottom: 3.5px double #000;
      margin-top: 3px;
      margin-bottom: 12px;
    }

    /* DOC TITLE */
    .doc-title {
      text-align: center;
      margin-bottom: 12px;
      font-size: 11pt;
      font-weight: bold;
    }

    /* TABLES */
    table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
    }
    td, th {
      border: none;
    }

    .meta-table td {
      vertical-align: top;
      font-size: 10pt;
    }

    .opening-p, .statement-p, .delivery-p, .closing-p {
      text-align: justify;
      margin-top: 10px;
      margin-bottom: 8px;
      line-height: 1.35;
      font-size: 10pt;
    }

    /* TABLE ITEMS DOC 1 */
    .tbl-doc1 {
      width: 100%;
      margin: 8px 0;
      border: 1.5px solid #000;
    }
    .tbl-doc1 th, .tbl-doc1 td {
      border: 1px solid #000;
      padding: 3.5px 6px;
      font-size: 9.5pt;
    }
    .tbl-doc1 th {
      font-weight: bold;
      text-align: center;
      background-color: #ffffff;
    }

    /* TABLE BAP DOC 2 */
    .tbl-bap {
      width: 100%;
      margin: 8px 0;
      border: 1.5px solid #000;
    }
    .tbl-bap th, .tbl-bap td {
      border: 1px solid #000;
      padding: 3px 5px;
      font-size: 9.5pt;
    }
    .tbl-bap th {
      font-weight: bold;
      text-align: center;
      background-color: #ffffff;
    }

    /* TABLE BAST DOC 3 */
    .tbl-bast {
      width: 100%;
      margin: 8px 0;
      border: 1.5px solid #000;
    }
    .tbl-bast th, .tbl-bast td {
      border: 1px solid #000;
      padding: 3.5px 6px;
      font-size: 9.5pt;
    }
    .tbl-bast th {
      font-weight: bold;
      text-align: center;
      background-color: #ffffff;
    }

    .delivery-meta td {
      padding: 1px 0;
      font-size: 10pt;
    }

    .examiners-meta td {
      padding: 1.5px 0;
      font-size: 10pt;
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
    @page { size: 215mm 330mm; margin: 10mm 15mm 10mm 15mm; }
  </style>

  <script>
    function setSize(sz, btnId) {
      document.getElementById('pgstyle').textContent = '@page { size: ' + sz + '; margin: 10mm 15mm 10mm 15mm; }';
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
    <button onclick="window.print()" style="background:#16a34a;color:#fff;border-color:#16a34a;">&#128438; Cetak Dokumen</button>
  </div>


  <!-- ==================== LAMPIRAN 1: SURAT PESANAN BARANG ==================== -->
  <div class="doc-page">
    <div class="kop-header">
      <div class="kop-title-1">TIM PELAKSANA KEGIATAN ( TPK )</div>
      <div class="kop-title-2">DESA CIMANGGU I</div>
      <div class="kop-title-3">KECAMATAN CIBUNGBULANG KABUPATEN BOGOR</div>
      <div class="kop-subtitle">Jl. Ciaruteun Gardu Kp.Ciaruteun Rt.004 Rw.008 Desa Cimanggu I Kecamatan Cibungbulang 16630 Bogor</div>
    </div>
    <div class="double-line"></div>

    <table class="meta-table" style="margin-bottom: 8px;">
      <tr>
        <td style="width: 50%;">
          <table>
            <tr><td style="width:75px;">Nomor</td><td>: &nbsp; ${order.nomorRegister}</td></tr>
            <tr><td>Lampiran</td><td>: &nbsp; --</td></tr>
            <tr><td>Perihal</td><td>: &nbsp; <b>Pesanan Barang</b></td></tr>
          </table>
        </td>
        <td style="width: 50%; text-align: left; padding-left: 20px;">
          Cimanggu I, ${formatDateIndo(order.tanggalPesanan)}<br>
          Kepada,<br>
          Yth, Toko “ <b>${order.toko}</b> ”<br>
          Di -<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>T e m p a t</b>
        </td>
      </tr>
    </table>

    <p class="opening-p">
      Untuk kebutuhan Pelaksanaan Kegiatan Infrastruktur ${order.sumberDana} ${order.namaKegiatanSampaiLokasi}, dengan ini kami TPK Desa Cimanggu I mohonkan bantuan pengadaan Barang sebagai berikut :
    </p>

    <table class="tbl-doc1">
      <thead>
        <tr>
          <th style="width: 35%;">Banyaknya</th>
          <th style="width: 65%;">Jenis Barang</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it: any) => `
          <tr>
            <td style="text-align: center;">${it.banyaknya} &nbsp;&nbsp; ${it.satuan}</td>
            <td style="text-align: left; padding-left: 15px;">${it.namaBarang}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p class="delivery-p">
      Untuk dikirim ke lokasi Kegiatan Infrastruktur ${order.sumberDana} ${order.namaKegiatanSampaiLokasi} pada :
    </p>
    <table class="delivery-meta" style="margin-left: 30px; margin-bottom: 8px;">
      <tr><td style="width: 90px;">Hari</td><td>: ${order.pengirimanHari}</td></tr>
      <tr><td>Tanggal</td><td>: ${formatDateIndo(order.pengirimanTanggal)}</td></tr>
      <tr><td>Jam</td><td>: ${order.pengirimanJam}</td></tr>
    </table>

    <p class="closing-p">
      Demikian pesanan ini, disampaikan dan atas kerjasamanya yang baik, diucapkan terima kasih.
    </p>

    <table style="width: 100%; margin-top: 15px; border: none;">
      <tr>
        <td style="width: 50%; border: none;"></td>
        <td style="width: 50%; text-align: center; border: none;">
          Tim Pelaksana Kegiatan (TPK)<br>
          Ketua<br><br><br><br>
          <u><b>${order.namaKetuaTPK}</b></u>
        </td>
      </tr>
    </table>
  </div>


  <!-- ==================== LAMPIRAN 2: BERITA ACARA PEMERIKSAAN BARANG ==================== -->
  <div class="doc-page">
    <div class="kop-header">
      <div class="kop-title-1">TIM PELAKSANA KEGIATAN ( TPK )</div>
      <div class="kop-title-2">DESA CIMANGGU I</div>
      <div class="kop-title-3">KECAMATAN CIBUNGBULANG KABUPATEN BOGOR</div>
      <div class="kop-subtitle">Alamat: Jl Raya Gardu Seri No.60 Kp. Ciaruteun Rt.004 Rw.008 Desa Cimanggu I Cibungbulang 16630 Bogor</div>
    </div>
    <div class="double-line"></div>

    <div class="doc-title">
      <u>BERITA ACARA PEMERIKSAAN BARANG</u><br>
      Nomor. ${order.nomorBap}
    </div>

    <p class="opening-p">
      Pada hari ini &nbsp;<b>${terbilangBap.hari}</b>&nbsp; tanggal &nbsp;<b>${terbilangBap.tanggalWords}</b>&nbsp; bulan &nbsp;<b>${terbilangBap.bulanWords}</b>&nbsp; tahun &nbsp;<b>${terbilangBap.tahunWords}</b>, kami yang bertanda tangan dibawah ini :
    </p>

    <table class="examiners-meta" style="margin-left: 20px; margin-bottom: 6px;">
      <tr><td style="width:25px;">1.</td><td style="width:220px;"><b>${order.pemeriksa1}</b></td><td>( Jabatan : TPK/ Pemeriksa barang )</td></tr>
      <tr><td>2.</td><td><b>${order.pemeriksa2}</b></td><td>( Jabatan : TPK/ Pemeriksa barang )</td></tr>
      <tr><td>3.</td><td><b>${order.pemeriksa3}</b></td><td>( Jabatan : TPK/ Pemeriksa barang )</td></tr>
    </table>

    <p class="statement-p">
      Berdasarkan Surat Pesanan Barang Nomor. ${order.nomorRegister}, tanggal ${formatDateIndo(order.tanggalPesanan)}, kami selaku Pemeriksa Barang, telah melaksanakan pemeriksaan barang yang diserahkan oleh Toko “ <b>${order.toko}</b> ”. Hasil pemeriksaan tersebut, kami simpulkan terhadap barang yang kondisinya baik kami beri tanda (v) dan barang yang kurang baik/tidak baik kami beri tanda (X), selanjutnya barang yang kondisinya tidak baik akan diserahkan kembali secara langsung kepada Toko “ <b>${order.toko}</b> ” selaku pelaksana pengadaan barang :
    </p>

    <table class="tbl-bap">
      <thead>
        <tr>
          <th style="width: 7%; border: 1px solid #000;" rowspan="2">No</th>
          <th style="width: 43%; border: 1px solid #000;" rowspan="2">Nama Barang</th>
          <th style="width: 15%; border: 1px solid #000;" rowspan="2">Banyaknya</th>
          <th style="width: 13%; border: 1px solid #000;" rowspan="2">Satuan</th>
          <th style="width: 22%; border: 1px solid #000;" colspan="2">Kesimpulan</th>
        </tr>
        <tr>
          <th style="width: 11%; border: 1px solid #000;">Baik</th>
          <th style="width: 11%; border: 1px solid #000;">Kurang baik</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it: any, idx: number) => `
          <tr>
            <td style="text-align: center; border: 1px solid #000;">${idx + 1}</td>
            <td style="text-align: left; padding-left: 10px; border: 1px solid #000;">${it.namaBarang}</td>
            <td style="text-align: center; border: 1px solid #000;">${it.banyaknya}</td>
            <td style="text-align: center; border: 1px solid #000;">${it.satuan}</td>
            <td style="text-align: center; border: 1px solid #000;"></td>
            <td style="text-align: center; border: 1px solid #000;"></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p class="closing-p">
      Demikian Berita Acara ini kami buat rangkap 3 (tiga) pada waktu dan tanggal tersebut
    </p>

    <table style="width: 100%; margin-top: 15px; border: none;">
      <tr>
        <td style="width: 45%; text-align: center; vertical-align: top; border: none;">
          Pelaksana Pengadaan Barang<br><br><br><br><br>
          <u><b>${order.namaPemilikToko}</b></u>
        </td>
        <td style="width: 55%; text-align: left; vertical-align: top; border: none; padding-left: 20px;">
          Pemeriksa Barang<br><br>
          <table style="width: 100%; border: none;">
            <tr><td style="width:20px; border:none;">1</td><td style="width:160px; border:none;"><b>${order.pemeriksa1}</b></td><td style="border:none;">( ................ )</td></tr>
            <tr><td style="border:none; padding-top:6px;">2</td><td style="border:none; padding-top:6px;"><b>${order.pemeriksa2}</b></td><td style="border:none; padding-top:6px;">( ................ )</td></tr>
            <tr><td style="border:none; padding-top:6px;">3</td><td style="border:none; padding-top:6px;"><b>${order.pemeriksa3}</b></td><td style="border:none; padding-top:6px;">( ................ )</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>


  <!-- ==================== LAMPIRAN 3: BERITA ACARA PENERIMAAN BARANG ==================== -->
  <div class="doc-page">
    <div class="kop-header">
      <div class="kop-title-1">TIM PELAKSANA KEGIATAN ( TPK )</div>
      <div class="kop-title-2">DESA CIMANGGU I</div>
      <div class="kop-title-3">KECAMATAN CIBUNGBULANG KABUPATEN BOGOR</div>
      <div class="kop-subtitle">Alamat: Jl Raya Gardu Seri No.60 Kp. Ciaruteun Rt.004 Rw.008 Desa Cimanggu I Cibungbulang 16630 Bogor</div>
    </div>
    <div class="double-line"></div>

    <div class="doc-title">
      <u>BERITA ACARA PENERIMAAN BARANG</u><br>
      Nomor. ${order.nomorBast}
    </div>

    <p class="opening-p">
      Pada hari ini &nbsp;<b>${terbilangBap.hari}</b>&nbsp; tanggal &nbsp;<b>${terbilangBap.tanggalWords}</b>&nbsp; bulan &nbsp;<b>${terbilangBap.bulanWords}</b>&nbsp; tahun &nbsp;<b>${terbilangBap.tahunWords}</b>, kami yang bertanda tangan dibawah ini :
    </p>

    <table class="recipient-meta" style="margin-left: 20px; margin-bottom: 8px;">
      <tr><td style="width:90px;">Nama</td><td>: &nbsp; <b>${order.namaKetuaTPK}</b></td></tr>
      <tr><td>Jabatan</td><td>: &nbsp; TPK / Penerima Barang</td></tr>
    </table>

    <p class="statement-p">
      Berdasarkan Surat Pesanan Barang Nomor. ${order.nomorRegister}, tanggal ${formatDateIndo(order.tanggalPesanan)}, telah menerima barang yang diserahkan oleh Toko “ <b>${order.toko}</b> ” sesuai dengan Berita Acara Pemeriksaan Barang Nomor. ${order.nomorBap}, tanggal ${formatDateIndo(order.pengirimanTanggal)} sebagai berikut:
    </p>

    <table class="tbl-bast">
      <thead>
        <tr>
          <th style="width: 10%; border: 1px solid #000;">NO</th>
          <th style="width: 50%; border: 1px solid #000;">NAMA BARANG</th>
          <th style="width: 20%; border: 1px solid #000;">BANYAKNYA</th>
          <th style="width: 20%; border: 1px solid #000;">SATUAN</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it: any, idx: number) => `
          <tr>
            <td style="text-align: center; border: 1px solid #000;">${idx + 1}</td>
            <td style="text-align: left; padding-left: 15px; border: 1px solid #000;">${it.namaBarang}</td>
            <td style="text-align: center; border: 1px solid #000;">${it.banyaknya}</td>
            <td style="text-align: center; border: 1px solid #000;">${it.satuan}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p class="closing-p">
      Demikian Berita Acara ini kami buat rangkap 3 (tiga) pada waktu dan tanggal tersebut
    </p>

    <table style="width: 100%; margin-top: 20px; border: none;">
      <tr>
        <td style="width: 50%; text-align: center; vertical-align: top; border: none;">
          Yang Menerima;<br>
          TPK/Penerima Barang<br><br><br><br><br>
          <u><b>${order.namaKetuaTPK}</b></u>
        </td>
        <td style="width: 50%; text-align: center; vertical-align: top; border: none;">
          Yang Menyerahkan;<br>
          Pelaksana Pengadaan Barang<br><br><br><br><br>
          <u><b>${order.namaPemilikToko}</b></u>
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
              <ShoppingBag size={22} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800">2. Pesanan Barang (LPJ Kesra)</h1>
              <p className="text-xs text-slate-500">Kelola Formulir Pesanan Barang, Berita Acara Pemeriksaan & Penerimaan Barang</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-600/20"
          >
            <Plus size={16} />
            <span>+ Buat Pesanan Barang</span>
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
              placeholder="Cari no pesanan / toko / kegiatan..."
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
                <th className="px-6 py-4">No. Register / BAP</th>
                <th className="px-6 py-4">Toko Supplier</th>
                <th className="px-6 py-4">Kegiatan & Lokasi</th>
                <th className="px-6 py-4">Pengadaan Material</th>
                <th className="px-6 py-4">Tgl Pengiriman</th>
                <th className="px-6 py-4 text-center">Cetak 3-Lampiran LPJ</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">Belum ada data pesanan barang.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono">
                      <div className="font-bold text-rose-700">{item.nomorRegister}</div>
                      <div className="text-slate-400">BAP: {item.nomorBap}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{item.toko}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                      <div className="font-bold text-emerald-700">{item.sumberDana}</div>
                      <div className="line-clamp-2 text-slate-600">{item.namaKegiatanSampaiLokasi}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-bold text-slate-700">{item.items?.length || 0} Jenis Barang</span>
                      <div className="text-slate-400 truncate max-w-[160px]">
                        {item.items?.map((it: any) => it.namaBarang).join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-slate-700">{item.pengirimanHari}, {formatDateIndo(item.pengirimanTanggal)}</div>
                      <div className="text-slate-400">Jam: {item.pengirimanJam}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handlePrintBundle(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <Printer size={14} />
                        <span>Cetak Paket F4 (3 Doc)</span>
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
              ? "Tidak ada data pesanan barang."
              : itemsPerPage === "ALL"
              ? `Menampilkan seluruh ${totalItems} pesanan barang.`
              : `Menampilkan ${(currentPage - 1) * (itemsPerPage as number) + 1} - ${Math.min(currentPage * (itemsPerPage as number), totalItems)} dari ${totalItems} pesanan.`}
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

      {/* FORM MODAL (+ Buat Pesanan Barang / Edit) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 md:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold">
                  <ShoppingBag size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {editingId ? "Edit Form Pesanan Barang LPJ" : "Form Pengisian Pesanan Barang LPJ"}
                  </h2>
                  <p className="text-xs text-slate-500">Isi data untuk menghasilkan 3 paket dokumen resmi LPJ</p>
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
              {/* SECTION 1: NOMOR-NOMOR SURAT */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100">
                <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} />
                  <span>1. Nomor Registrasi & Berita Acara</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Surat Pesanan</label>
                    <input 
                      type="text"
                      value={formData.nomorRegister}
                      onChange={(e) => setFormData({ ...formData, nomorRegister: e.target.value })}
                      placeholder="007/TPK/VI/2024"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-rose-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor BA Pemeriksaan (BAP)</label>
                    <input 
                      type="text"
                      value={formData.nomorBap}
                      onChange={(e) => setFormData({ ...formData, nomorBap: e.target.value })}
                      placeholder="008/TPK/VI/2024"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-rose-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor BA Penerimaan (BAST)</label>
                    <input 
                      type="text"
                      value={formData.nomorBast}
                      onChange={(e) => setFormData({ ...formData, nomorBast: e.target.value })}
                      placeholder="009/TPK/VI/2024"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-rose-500/20"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: TANGGAL, TOKO & KEGIATAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">2. Tanggal Pesanan (Isian Manual)</label>
                  <input 
                    type="date"
                    value={formData.tanggalPesanan}
                    onChange={(e) => setFormData({ ...formData, tanggalPesanan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:ring-2 focus:ring-rose-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. Toko / Supplier (Dropdown)</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.toko}
                      onChange={(e) => setFormData({ ...formData, toko: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500/20"
                    >
                      {tokoOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: KEGIATAN INFRASTRUKTUR */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">4. Sumber Dana Kegiatan (Dropdown)</label>
                  <select
                    value={formData.sumberDana}
                    onChange={(e) => setFormData({ ...formData, sumberDana: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:ring-2 focus:ring-rose-500/20"
                  >
                    {sumberDanaOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan Sampai Lokasi</label>
                  <textarea
                    rows={2}
                    value={formData.namaKegiatanSampaiLokasi}
                    onChange={(e) => setFormData({ ...formData, namaKegiatanSampaiLokasi: e.target.value })}
                    placeholder="Contoh: Betonisasi Jalan Lingkungan di Kp. Cimanggu Rt. 004 Rw. 001 Desa Cimanggu I Kecamatan Cibungbulang Kabupaten Bogor"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20"
                    required
                  />
                </div>
              </div>

              {/* SECTION 4: KOLOM PENGISIAN BARANG (DYNAMIC ROWS) */}
              <div className="bg-rose-50/50 p-4 rounded-2xl space-y-4 border border-rose-100 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag size={16} />
                    <span>5. Daftar Barang Yang Dipesan (Dynamic RAB)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-rose-600/20"
                  >
                    <Plus size={14} />
                    <span>+ Tambah Baris Barang</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
                      <span className="font-bold text-slate-400 w-6 text-center">{idx + 1}.</span>
                      <div className="w-24">
                        <input
                          type="text"
                          value={it.banyaknya}
                          onChange={(e) => handleItemChange(idx, "banyaknya", e.target.value)}
                          placeholder="Banyaknya (e.g. 9)"
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-center font-bold text-xs"
                          required
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="text"
                          value={it.satuan}
                          onChange={(e) => handleItemChange(idx, "satuan", e.target.value)}
                          placeholder="Satuan (e.g. M3, Zak, Bh)"
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-center font-bold text-xs"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={it.namaBarang}
                          onChange={(e) => handleItemChange(idx, "namaBarang", e.target.value)}
                          placeholder="Jenis / Nama Barang (e.g. Pasir Beton)"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-xs"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Baris"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: PENGIRIMAN DAN WAKTU */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100 text-xs">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <PackageCheck size={16} />
                  <span>6 & 7. Jadwal Pengiriman Ke Lokasi</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hari Pengiriman</label>
                    <input 
                      type="text"
                      value={formData.pengirimanHari}
                      onChange={(e) => setFormData({ ...formData, pengirimanHari: e.target.value })}
                      placeholder="Kamis"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Pengiriman</label>
                    <input 
                      type="date"
                      value={formData.pengirimanTanggal}
                      onChange={(e) => setFormData({ ...formData, pengirimanTanggal: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jam Pengiriman</label>
                    <input 
                      type="text"
                      value={formData.pengirimanJam}
                      onChange={(e) => setFormData({ ...formData, pengirimanJam: e.target.value })}
                      placeholder="08.00 Wib"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: PENANDATANGAN & PEMERIKSA BARANG */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100 text-xs">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={16} />
                  <span>8. Nama Penandatangan & Tim Pemeriksa</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Ketua TPK with Lock Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Nama Ketua TPK (Penerima)</label>
                      <button
                        type="button"
                        onClick={() => setIsNamaKetuaLocked(!isNamaKetuaLocked)}
                        className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:underline"
                      >
                        {isNamaKetuaLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        <span>{isNamaKetuaLocked ? "Terkunci" : "Buka Kunci"}</span>
                      </button>
                    </div>
                    <input 
                      type="text"
                      value={formData.namaKetuaTPK}
                      disabled={isNamaKetuaLocked}
                      onChange={(e) => setFormData({ ...formData, namaKetuaTPK: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold uppercase text-xs disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>

                  {/* Nama Pemilik Toko */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Toko (Pelaksana Pengadaan)</label>
                    <input 
                      type="text"
                      value={formData.namaPemilikToko}
                      onChange={(e) => setFormData({ ...formData, namaPemilikToko: e.target.value })}
                      placeholder="YANTO SETIAWAN"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold uppercase text-xs"
                      required
                    />
                  </div>
                </div>

                {/* 3 Tim Pemeriksa Barang */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-bold text-slate-700 mb-2">Tim Pemeriksa Barang (3 Orang TPK)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">Pemeriksa 1:</span>
                      <input 
                        type="text"
                        value={formData.pemeriksa1}
                        onChange={(e) => setFormData({ ...formData, pemeriksa1: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold uppercase text-xs mt-0.5"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">Pemeriksa 2:</span>
                      <input 
                        type="text"
                        value={formData.pemeriksa2}
                        onChange={(e) => setFormData({ ...formData, pemeriksa2: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold uppercase text-xs mt-0.5"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500">Pemeriksa 3:</span>
                      <input 
                        type="text"
                        value={formData.pemeriksa3}
                        onChange={(e) => setFormData({ ...formData, pemeriksa3: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold uppercase text-xs mt-0.5"
                        required
                      />
                    </div>
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
                  {editingId ? "Simpan Perubahan" : "Simpan Pesanan Barang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
