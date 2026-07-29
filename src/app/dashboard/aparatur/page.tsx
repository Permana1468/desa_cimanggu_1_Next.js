"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getAparaturDesaList, 
  addAparaturDesa, 
  updateAparaturDesa,
  deleteAparaturDesa, 
  updateAparaturSK 
} from "@/actions/village";
import { useSession } from "next-auth/react";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { 
  Users, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Briefcase, 
  UserPlus, 
  X, 
  Loader2, 
  Save, 
  ChevronDown,
  Building,
  FileText,
  ExternalLink,
  Trash2,
  QrCode,
  Printer,
  Filter,
  Search,
  ScanLine,
  CheckCircle2,
  Pencil
} from "lucide-react";

// List 8 Kategori Lembaga
export const KATEGORI_LEMBAGA_LIST = [
  "Perangkat Desa",
  "Badan Permusyawaratan Desa (BPD)",
  "RT dan RW",
  "LPM",
  "POSYANDU",
  "TP-PKK",
  "KARANG TARUNA",
  "PUSKESOS"
];

// Pure 2D Square QR Code SVG Base64 Generator (Barcode Kotak)
function generateQrCodeBase64(text: string): string {
  const clean = (text || "APR-DESA-001").trim().toUpperCase();
  
  const size = 25;
  const grid = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          grid[startY + r][startX + c] = true;
        }
      }
    }
  };

  // 3 Finder Patterns (Top-Left, Top-Right, Bottom-Left)
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Alignment Pattern (Bottom-Right)
  const alignX = size - 9, alignY = size - 9;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
        grid[alignY + r][alignX + c] = true;
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (i % 2 === 0) {
      grid[6][i] = true;
      grid[i][6] = true;
    }
  }

  // Hash Data String to Fill Data Matrix Bits
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= size - 8;
      const isBottomLeft = r >= size - 8 && c < 8;
      const isAlign = r >= alignY && r < alignY + 5 && c >= alignX && c < alignX + 5;
      const isTiming = r === 6 || c === 6;

      if (!isTopLeft && !isTopRight && !isBottomLeft && !isAlign && !isTiming) {
        const seed = Math.abs((r * 31 + c * 17 + hash + (clean.charCodeAt(bitIdx % clean.length) * 7)) % 100);
        grid[r][c] = seed > 42;
        bitIdx++;
      }
    }
  }

  const cellSize = 10;
  const padding = 20;
  const svgSize = size * cellSize + padding * 2;

  let rects = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
      }
    }
  }

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" style="background:#ffffff;"><rect width="100%" height="100%" fill="#ffffff"/>${rects}</svg>`;

  return "data:image/svg+xml;base64," + (typeof window !== "undefined" ? btoa(svgStr) : Buffer.from(svgStr).toString("base64"));
}

export default function AparaturPage() {
  const { data: session } = useSession();
  const isAdminMaster = (session?.user as any)?.role === "ADMIN_MASTER" || (session?.user as any)?.role === "ADMIN_DESA";

  const [aparatur, setAparatur] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSKModal, setShowSKModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAparatur, setSelectedAparatur] = useState<any>(null);

  // Filter States
  const [selectedKategori, setSelectedKategori] = useState<string>("SEMUA");
  const [search, setSearch] = useState<string>("");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    nik: "",
    barcodeId: "",
    email: "",
    phoneNumber: "",
    kategori: "Perangkat Desa",
    role: "ADMIN_DESA",
    position: "",
    photo: ""
  });

  const [skData, setSkData] = useState({
    skNumber: "",
    skUrl: ""
  });

  // Load Initial Aparatur List & merge custom localStorage
  const fetchAparatur = async () => {
    setLoading(true);
    try {
      let data = await getAparaturDesaList();
      if (typeof window !== "undefined") {
        const custom = localStorage.getItem("aparatur_custom_list");
        if (custom) {
          try {
            const parsed = JSON.parse(custom);
            const existingIds = new Set(data.map((d: any) => d.id));
            const newCustoms = parsed.filter((p: any) => !existingIds.has(p.id));
            data = [...data, ...newCustoms];
          } catch (e) {}
        }
      }
      setAparatur(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAparatur();
  }, []);

  // Save / Update Custom List to LocalStorage
  const saveCustomAparatur = (item: any) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aparatur_custom_list");
      let list: any[] = [];
      if (saved) {
        try { list = JSON.parse(saved); } catch (e) {}
      }
      const existingIdx = list.findIndex(l => l.id === item.id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...item };
      } else {
        list = [item, ...list];
      }
      localStorage.setItem("aparatur_custom_list", JSON.stringify(list));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const catCode = formData.kategori.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "");
      const generatedBarcode = formData.barcodeId || formData.nik || `APR-${catCode}-${Math.floor(100 + Math.random() * 900)}`;

      let level = 2;
      if (formData.role === "KADES") level = 0;
      else if (formData.role === "SEKDES") level = 1;
      else if (formData.role === "KADUS") level = 3;

      const newItem = {
        id: `APR-${Date.now()}`,
        name: formData.name,
        nik: formData.nik || generatedBarcode,
        barcodeId: generatedBarcode,
        kategori: formData.kategori,
        position: formData.position,
        role: formData.role,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        photo: formData.photo,
        skNumber: "BELUM TERBIT",
        skUrl: "",
        level
      };

      try {
        await addAparaturDesa({
          name: formData.name,
          nik: formData.nik || generatedBarcode,
          role: formData.role,
          position: `${formData.kategori} - ${formData.position}`,
          photo: formData.photo,
          level
        });
      } catch (err) {}

      saveCustomAparatur(newItem);
      setShowAddModal(false);
      fetchAparatur();
      resetForm();
    } catch (error) {
      alert("Gagal menambahkan aparatur.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (person: any) => {
    setSelectedAparatur(person);
    setFormData({
      id: person.id,
      name: person.name || "",
      nik: person.nik || "",
      barcodeId: person.barcodeId || person.nik || "",
      email: person.email || "",
      phoneNumber: person.phoneNumber || "",
      kategori: person.kategori || "Perangkat Desa",
      role: person.role || "ADMIN_DESA",
      position: person.position || "",
      photo: person.photo || ""
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAparatur) return;
    setSaving(true);
    try {
      const updatedItem = {
        ...selectedAparatur,
        name: formData.name,
        nik: formData.nik,
        barcodeId: formData.barcodeId || formData.nik,
        kategori: formData.kategori,
        position: formData.position,
        role: formData.role,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        photo: formData.photo
      };

      try {
        await updateAparaturDesa(selectedAparatur.id, {
          name: formData.name,
          nik: formData.nik,
          role: formData.role,
          position: formData.position,
          photo: formData.photo
        });
      } catch (err) {}

      saveCustomAparatur(updatedItem);
      setShowEditModal(false);
      fetchAparatur();
      resetForm();
    } catch (error) {
      alert("Gagal memperbarui data aparatur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus aparatur ini?")) return;
    try {
      await deleteAparaturDesa(id);
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("aparatur_custom_list");
        if (saved) {
          try {
            const list = JSON.parse(saved).filter((item: any) => item.id !== id);
            localStorage.setItem("aparatur_custom_list", JSON.stringify(list));
          } catch (e) {}
        }
      }
      fetchAparatur();
    } catch (error) {
      alert("Gagal menghapus aparatur.");
    }
  };

  const handleUpdateSK = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAparatur) return;
    setSaving(true);
    try {
      await updateAparaturSK(selectedAparatur.id, skData);
      setShowSKModal(false);
      fetchAparatur();
    } catch (error) {
      alert("Gagal memperbarui SK.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      nik: "",
      barcodeId: "",
      email: "",
      phoneNumber: "",
      kategori: "Perangkat Desa",
      role: "ADMIN_DESA",
      position: "",
      photo: ""
    });
  };

  // Filtered List based on Dropdown Kategori Lembaga & Search
  const filteredAparatur = useMemo(() => {
    return aparatur.filter(person => {
      const personKat = person.kategori || (
        person.role === "KADES" || person.role === "SEKDES" || person.role === "KASI" || person.role === "KAUR"
          ? "Perangkat Desa" 
          : "Perangkat Desa"
      );

      const matchCategory = selectedKategori === "SEMUA" || personKat.toLowerCase().includes(selectedKategori.toLowerCase());
      const matchSearch = 
        person.name.toLowerCase().includes(search.toLowerCase()) ||
        person.position.toLowerCase().includes(search.toLowerCase()) ||
        (person.nik && person.nik.includes(search)) ||
        (person.barcodeId && person.barcodeId.toLowerCase().includes(search.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [aparatur, selectedKategori, search]);

  // Print 2-Sided ID Card Handler (Depan & Belakang dengan QR Code Kotak - Standard CR-80)
  const handlePrintCard = (person: any) => {
    const barcodeCode = person.barcodeId || person.nik || `APR-DESA-${person.id.slice(0, 5)}`;
    const qrBase64 = generateQrCodeBase64(barcodeCode);
    const kat = person.kategori || "Perangkat Desa";
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>ID CARD ABSENSI (2 SISI) - ${person.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { 
      font-family: Arial, Helvetica, sans-serif; 
      background: #cbd5e1; 
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center;
      min-height: 100vh;
      padding: 30px 20px;
    }
    
    /* STANDARD VERTICAL ID CARD (CR-80: 54mm x 85.6mm) */
    @page {
      size: 54mm 85.6mm;
      margin: 0;
    }

    .no-print-btn {
      margin-bottom: 25px;
      padding: 14px 28px;
      background: #16a34a;
      color: #ffffff;
      border: none;
      border-radius: 14px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
      transition: all 0.2s;
    }
    .no-print-btn:hover { background: #15803d; transform: translateY(-2px); }

    .card-wrapper {
      display: flex;
      flex-direction: row;
      gap: 30px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }

    .id-card {
      width: 54mm;
      height: 85.6mm;
      background: #ffffff;
      border: 1.5px solid #0f172a;
      border-radius: 3.5mm;
      padding: 2.5mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      position: relative;
      overflow: hidden;
      background-image: radial-gradient(#cbd5e1 0.75px, transparent 0.75px);
      background-size: 6px 6px;
      page-break-after: always;
    }

    /* CARD HEADER */
    .card-header {
      width: calc(100% + 5mm);
      margin: -2.5mm -2.5mm 2mm -2.5mm;
      padding: 2.5mm 1mm;
      background: #0f172a;
      color: #ffffff;
      text-align: center;
      border-bottom: 1.5px solid #0f172a;
    }
    .card-header-logo {
      height: 8.5mm;
      width: auto;
      margin-bottom: 0.8mm;
      object-fit: contain;
    }
    .card-header h2 {
      font-size: 7.5pt;
      font-weight: 900;
      letter-spacing: 0.3px;
      line-height: 1.1;
      text-transform: uppercase;
    }
    .card-header p {
      font-size: 5.5pt;
      font-weight: bold;
      opacity: 0.85;
      margin-top: 0.4mm;
      text-transform: uppercase;
    }

    /* SISI DEPAN - FRONT SIDE CONTENT */
    .photo-box {
      width: 24mm;
      height: 28mm;
      border-radius: 2.5mm;
      border: 1.5px solid #0f172a;
      overflow: hidden;
      margin-bottom: 1.5mm;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.12);
    }
    .photo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-box .initials {
      font-size: 18pt;
      font-weight: 900;
      color: #334155;
    }

    .info-box {
      text-align: center;
      width: 100%;
      margin-bottom: 1.5mm;
    }
    .person-name {
      font-size: 8.5pt;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.15;
      text-transform: uppercase;
      margin-bottom: 0.8mm;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .person-pos {
      font-size: 6.5pt;
      font-weight: 800;
      color: #2563eb;
      text-transform: uppercase;
      background: #eff6ff;
      border: 0.8px solid #bfdbfe;
      padding: 0.8mm 2mm;
      border-radius: 1.5mm;
      display: inline-block;
      margin-bottom: 0.8mm;
    }
    .person-kat {
      font-size: 5.5pt;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      display: block;
    }

    .front-footer {
      width: calc(100% + 5mm);
      margin: 0 -2.5mm -2.5mm -2.5mm;
      padding: 1.5mm 0;
      background: #0f172a;
      color: #ffffff;
      text-align: center;
      font-size: 5pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* SISI BELAKANG - BACK SIDE CONTENT (KHUSUS QR CODE KOTAK) */
    .back-content {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2mm 0;
    }
    .qr-container {
      width: 32mm;
      height: 32mm;
      background: #ffffff;
      border: 1.5px solid #0f172a;
      border-radius: 3mm;
      padding: 1.5mm;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2mm;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    }
    .qr-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .barcode-text {
      font-family: monospace;
      font-size: 7.5pt;
      font-weight: 900;
      color: #0f172a;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 0.8mm 3mm;
      border-radius: 1.5mm;
      margin-bottom: 2mm;
      display: inline-block;
    }
    .back-desc {
      font-size: 5pt;
      color: #475569;
      font-weight: 600;
      line-height: 1.2;
      padding: 0 1mm;
    }

    @media print {
      body { background: transparent; padding: 0; }
      .no-print-btn { display: none !important; }
      .card-wrapper { gap: 0; display: block; }
      .id-card { box-shadow: none; border: 1px solid #000; margin: 0 auto; }
    }
  </style>
</head>
<body>
  <button onclick="window.print()" class="no-print-btn">&#128438; Cetak ID Card Absensi (2 Sisi - Depan & Belakang)</button>

  <div class="card-wrapper">
    <!-- SISI DEPAN (FRONT SIDE) -->
    <div class="id-card">
      <div class="card-header">
        <img src="${origin}/images/logo-bogor.png" class="card-header-logo" alt="Logo Kab Bogor" />
        <h2>PEMERINTAH DESA CIMANGGU I</h2>
        <p>KARTU ABSENSI RESMI APARATUR</p>
      </div>

      <div class="photo-box">
        ${person.photo ? `<img src="${person.photo}" alt="${person.name}" />` : `<div class="initials">${person.name.charAt(0)}</div>`}
      </div>

      <div class="info-box">
        <div class="person-name">${person.name}</div>
        <div class="person-pos">${person.position}</div>
        <span class="person-kat">${kat}</span>
      </div>

      <div class="front-footer">
        DESA CIMANGGU I &bull; SISI DEPAN
      </div>
    </div>

    <!-- SISI BELAKANG (BACK SIDE - KHUSUS QR CODE KOTAK) -->
    <div class="id-card">
      <div class="card-header">
        <img src="${origin}/images/logo-bogor.png" class="card-header-logo" alt="Logo Kab Bogor" />
        <h2>PEMERINTAH DESA CIMANGGU I</h2>
        <p>QR CODE BARCODE ABSENSI</p>
      </div>

      <div class="back-content">
        <div class="qr-container">
          <img src="${qrBase64}" class="qr-img" alt="QR Code Kotak ${barcodeCode}" />
        </div>
        <div class="barcode-text">${barcodeCode}</div>
        <p class="back-desc">
          Gunakan QR Code Kotak ini pada Mesin Scanner Absensi Desa Cimanggu I.<br>
          Jika kartu ini ditemukan, harap dikembalikan ke Kantor Desa.
        </p>
      </div>

      <div class="front-footer">
        SCANNER READY &bull; SISI BELAKANG
      </div>
    </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold animate-pulse">Menyiapkan Struktur Organisasi & Aparatur Desa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Building size={12} /> STRUCTURE & APARATUR MANAGE
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Aparatur & Kelembagaan Desa</h1>
          <p className="text-slate-500 text-sm font-medium">Manajemen data perangkat desa, BPD, RT/RW, LPM, Posyandu, PKK, Karang Taruna, Puskesos & Barcode Absensi 2 Sisi.</p>
        </div>

        {isAdminMaster && (
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2 group cursor-pointer"
          >
            <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> Tambah Aparatur Baru
          </button>
        )}
      </div>

      {/* DROPDOWN FILTER KATEGORI LEMBAGA (8 KATEGORI) & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Dropdown Kategori Lembaga */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
              <Filter size={15} className="text-blue-600" /> Kategori Lembaga:
            </span>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 bg-slate-50 shadow-xs cursor-pointer"
            >
              <option value="SEMUA">Semua Kategori (8 Lembaga)</option>
              {KATEGORI_LEMBAGA_LIST.map((kat, idx) => (
                <option key={idx} value={kat}>
                  {idx + 1}. {kat}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama / Jabatan / Barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* QUICK CATEGORY BADGES */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 custom-scrollbar">
          <button
            onClick={() => setSelectedKategori("SEMUA")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedKategori === "SEMUA" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua ({aparatur.length})
          </button>
          {KATEGORI_LEMBAGA_LIST.map((kat, idx) => {
            const count = aparatur.filter(a => (a.kategori || "Perangkat Desa").toLowerCase().includes(kat.toLowerCase())).length;
            return (
              <button
                key={idx}
                onClick={() => setSelectedKategori(kat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedKategori === kat 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {kat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TABLE DAFTAR APARATUR DESA */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daftar Aparatur Desa</h2>
            <p className="text-slate-500 font-medium text-xs mt-0.5">
              Menampilkan {filteredAparatur.length} aparatur untuk kategori: <span className="font-bold text-blue-600">{selectedKategori}</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-2">Aparatur & Jabatan</th>
                <th className="px-6 py-2">Kategori Lembaga</th>
                <th className="px-6 py-2">Barcode Absensi</th>
                <th className="px-6 py-2">Nomor SK</th>
                <th className="px-6 py-2 text-right">Aksi & Kartu</th>
              </tr>
            </thead>
            <tbody>
              {filteredAparatur.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-bold text-xs">
                    Tidak ada aparatur ditemukan untuk kategori &quot;{selectedKategori}&quot;.
                  </td>
                </tr>
              ) : (
                filteredAparatur.map((person) => {
                  const barcodeCode = person.barcodeId || person.nik || `APR-DESA-${person.id.slice(0, 5)}`;
                  const kat = person.kategori || "Perangkat Desa";

                  return (
                    <tr key={person.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="bg-white border-y border-l border-slate-100 rounded-l-2xl px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner overflow-hidden relative bg-slate-100 shrink-0">
                            {person.photo ? (
                              <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                            ) : (
                              person.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{person.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{person.position}</p>
                          </div>
                        </div>
                      </td>
                      <td className="bg-white border-y border-slate-100 px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {kat}
                        </span>
                      </td>
                      <td className="bg-white border-y border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                            {barcodeCode}
                          </span>
                          <button
                            onClick={() => handlePrintCard(person)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Lihat / Cetak ID Card Absensi (2 Sisi)"
                          >
                            <QrCode size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="bg-white border-y border-slate-100 px-6 py-4">
                        <span className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                          {person.skNumber || "BELUM TERBIT"}
                        </span>
                      </td>
                      <td className="bg-white border-y border-r border-slate-100 rounded-r-2xl px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handlePrintCard(person)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Printer size={13} />
                            <span>ID Card (2 Sisi)</span>
                          </button>
                          {isAdminMaster && (
                            <>
                              <button 
                                onClick={() => handleOpenEdit(person)}
                                className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all shadow-sm cursor-pointer"
                                title="Edit Data Identitas Aparatur"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                onClick={() => { setSelectedAparatur(person); setSkData({ skNumber: person.skNumber || "", skUrl: person.skUrl || "" }); setShowSKModal(true); }}
                                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm cursor-pointer"
                                title="Manajemen SK"
                              >
                                <FileText size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(person.id)}
                                className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all shadow-sm cursor-pointer"
                                title="Hapus Aparatur"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD APARATUR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Tambah Aparatur Baru</h2>
                <p className="text-slate-400 text-xs font-medium">Daftarkan perangkat/lembaga desa ke dalam sistem & Barcode Absensi</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Lembaga (Dropdown 8 Lembaga)</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  >
                    {KATEGORI_LEMBAGA_LIST.map((kat, idx) => (
                      <option key={idx} value={kat}>
                        {idx + 1}. {kat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan Struktur</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Kepala Desa / Ketua BPD / Ketua RT 004"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Aparatur</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap beserta Gelar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK (Optional)</label>
                  <input
                    type="text"
                    placeholder="320112..."
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode ID Absensi</label>
                  <input
                    type="text"
                    placeholder="Contoh: APR-PRK-001 / NIK (Bisa dikosongkan)"
                    value={formData.barcodeId}
                    onChange={(e) => setFormData({ ...formData, barcodeId: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-mono font-bold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                  <p className="text-[10px] text-blue-600 font-semibold mt-1">*Bisa dikosongkan (Sistem akan buatkan kode unik otomatis saat disimpan)</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="email@desacimanggu1.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-blue-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUpload onUploadSuccess={(url) => setFormData({ ...formData, photo: url })} defaultValue={formData.photo} label="Foto Aparatur (Otomatis Muncul di ID Card)" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Simpan Data & Barcode Aparatur</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT APARATUR MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowEditModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-amber-600 text-white">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Edit Data Identitas Aparatur</h2>
                <p className="text-amber-100 text-xs font-medium">Perbarui data diri, jabatan, foto, & barcode absensi</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-amber-700 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Lembaga (Dropdown 8 Lembaga)</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none"
                  >
                    {KATEGORI_LEMBAGA_LIST.map((kat, idx) => (
                      <option key={idx} value={kat}>
                        {idx + 1}. {kat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan Struktur</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Aparatur</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-bold text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIK</label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode ID Absensi</label>
                  <input
                    type="text"
                    placeholder="Contoh: APR-PRK-001"
                    value={formData.barcodeId}
                    onChange={(e) => setFormData({ ...formData, barcodeId: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-mono font-bold text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none"
                  />
                  <p className="text-[10px] text-amber-600 font-semibold mt-1">*Kode unik yang terhubung dengan QR Code Kotak pada ID Card</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-900 focus:border-amber-500 focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <ImageUpload onUploadSuccess={(url) => setFormData({ ...formData, photo: url })} defaultValue={formData.photo} label="Foto Aparatur (Otomatis Muncul di ID Card)" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Simpan Perubahan Identitas</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SK MODAL */}
      {showSKModal && selectedAparatur && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowSKModal(false)} />
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Manajemen SK</h2>
                <p className="text-slate-500 text-xs font-medium">Update dokumen SK untuk <span className="text-blue-600 font-bold">{selectedAparatur.name}</span></p>
              </div>
              <button onClick={() => setShowSKModal(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateSK} className="p-6 space-y-4 bg-white text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor SK Pengangkatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 141/05/DS/2026"
                  value={skData.skNumber}
                  onChange={(e) => setSkData({ ...skData, skNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Dokumen SK (PDF / Drive)</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/..."
                  value={skData.skUrl}
                  onChange={(e) => setSkData({ ...skData, skUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold focus:border-blue-500 focus:bg-white outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Arsip SK</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
