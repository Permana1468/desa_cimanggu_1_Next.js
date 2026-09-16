"use client";

import React, { useState, useEffect } from "react";
import { SafePrintPortal } from "./SafePrintPortal";
import { 
  Printer, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Search,
  Filter,
  Eye,
  FileText,
  Table,
  Pencil,
  X,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import { getRkkdPagus, updateRkkdPagu } from "@/lib/rkkdStore";

export interface RkkdAddItem {
  id: string;
  bidangNo: string;
  bidangName: string;
  subBidangName: string;
  kategoriGroup: string; // e.g. "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa"
  namaKegiatan: string;
  volCount: number;
  volMultiplier: number;
  satuanBiaya: number;
  sumberDana: "ADD";
}

const defaultAddList: RkkdAddItem[] = [
  // A. Penghasilan Tetap
  { id: "add-1", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "1. Kepala Desa", volCount: 1, volMultiplier: 12, satuanBiaya: 4750000, sumberDana: "ADD" },
  { id: "add-2", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "2. Sekretaris Desa", volCount: 1, volMultiplier: 12, satuanBiaya: 3750000, sumberDana: "ADD" },
  { id: "add-3", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "3. Kasi Pelayanan", volCount: 1, volMultiplier: 12, satuanBiaya: 3000000, sumberDana: "ADD" },
  { id: "add-4", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "4. Kasi Pemerintahan", volCount: 1, volMultiplier: 12, satuanBiaya: 3000000, sumberDana: "ADD" },
  { id: "add-5", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "5. Kasi Kesejahteraan", volCount: 1, volMultiplier: 12, satuanBiaya: 3000000, sumberDana: "ADD" },
  { id: "add-6", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "6. Kaur Perencanaan", volCount: 1, volMultiplier: 12, satuanBiaya: 2850000, sumberDana: "ADD" },
  { id: "add-7", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "7. Kaur Keuangan", volCount: 1, volMultiplier: 12, satuanBiaya: 2850000, sumberDana: "ADD" },
  { id: "add-8", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "8. Kaur TU & Umum", volCount: 1, volMultiplier: 12, satuanBiaya: 2850000, sumberDana: "ADD" },
  { id: "add-9", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "9. Kepala Dusun I", volCount: 1, volMultiplier: 12, satuanBiaya: 2025000, sumberDana: "ADD" },
  { id: "add-10", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "10. Kepala Dusun II", volCount: 1, volMultiplier: 12, satuanBiaya: 2025000, sumberDana: "ADD" },
  { id: "add-11", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "11. Kepala Dusun III", volCount: 1, volMultiplier: 12, satuanBiaya: 2025000, sumberDana: "ADD" },
  { id: "add-12", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "A. Penghasilan Tetap Kepala Desa dan Perangkat Desa", namaKegiatan: "12. Kepala Dusun IV", volCount: 1, volMultiplier: 12, satuanBiaya: 2025000, sumberDana: "ADD" },

  // B. Operasional Pemdes
  { id: "add-13", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "B. Penyediaan Operasional Pemerintah Desa", namaKegiatan: "1. Operasional Pemdes", volCount: 1, volMultiplier: 12, satuanBiaya: 500000, sumberDana: "ADD" },

  // C. Penyediaan Tunjangan BPD
  { id: "add-14", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "C. Penyediaan Tunjangan BPD", namaKegiatan: "1. Ketua BPD", volCount: 1, volMultiplier: 12, satuanBiaya: 1050000, sumberDana: "ADD" },
  { id: "add-15", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "C. Penyediaan Tunjangan BPD", namaKegiatan: "2. Wakil Ketua BPD", volCount: 1, volMultiplier: 12, satuanBiaya: 950000, sumberDana: "ADD" },
  { id: "add-16", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "C. Penyediaan Tunjangan BPD", namaKegiatan: "3. Sekretaris BPD", volCount: 1, volMultiplier: 12, satuanBiaya: 900000, sumberDana: "ADD" },
  { id: "add-17", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "C. Penyediaan Tunjangan BPD", namaKegiatan: "4. Anggota BPD", volCount: 6, volMultiplier: 12, satuanBiaya: 800000, sumberDana: "ADD" },

  // D. Operasional BPD
  { id: "add-18", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "D. Penyediaan Operasional BPD", namaKegiatan: "1. Operasional BPD", volCount: 1, volMultiplier: 12, satuanBiaya: 1500000, sumberDana: "ADD" },

  // E. Insentif RT/RW
  { id: "add-19", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "E. Penyediaan Insentif RT RW", namaKegiatan: "1. RT", volCount: 32, volMultiplier: 12, satuanBiaya: 600000, sumberDana: "ADD" },
  { id: "add-20", bidangNo: "1", bidangName: "PENYELENGGARAAN PEMERINTAHAN DESA", subBidangName: "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA", kategoriGroup: "E. Penyediaan Insentif RT RW", namaKegiatan: "2. RW", volCount: 9, volMultiplier: 12, satuanBiaya: 600000, sumberDana: "ADD" },

  // F. Insentif Posyandu
  { id: "add-21", bidangNo: "2", bidangName: "PELAKSANAAN PEMBANGUNAN DESA", subBidangName: "KESEHATAN", kategoriGroup: "F. Insentif Posyandu (ADD Khusus)", namaKegiatan: "1. Operasional Posyandu", volCount: 7, volMultiplier: 1, satuanBiaya: 3000000, sumberDana: "ADD" },

  // H. Insentif Guru Ngaji
  { id: "add-22", bidangNo: "2", bidangName: "PELAKSANAAN PEMBANGUNAN DESA", subBidangName: "KEBUDAYAAN DAN KEAGAMAAN", kategoriGroup: "H. Insentif Guru Ngaji", namaKegiatan: "1. Insentif Guru Ngaji", volCount: 25, volMultiplier: 12, satuanBiaya: 200000, sumberDana: "ADD" },

  // G. Insentif Linmas
  { id: "add-23", bidangNo: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangName: "KETENTRAMAN, KETERTIBAN UMUM DAN PERLINDUNGAN MASYARAKAT", kategoriGroup: "G. Insentif Linmas Desa", namaKegiatan: "1. Insentif Linmas Desa", volCount: 10, volMultiplier: 12, satuanBiaya: 300000, sumberDana: "ADD" }
];

export function RkkdAddSection() {
  const [items, setItems] = useState<RkkdAddItem[]>(defaultAddList);
  const [paguAdd, setPaguAdd] = useState<number>(916400000);
  const [isEditingPagu, setIsEditingPagu] = useState(false);
  const [paguInputVal, setPaguInputVal] = useState<number>(916400000);
  
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "print-preview">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RkkdAddItem | null>(null);

  // Form State
  const [newKategori, setNewKategori] = useState("A. Penghasilan Tetap Kepala Desa dan Perangkat Desa");
  const [newNamaKegiatan, setNewNamaKegiatan] = useState("");
  const [newVolCount, setNewVolCount] = useState<number>(1);
  const [newVolMultiplier, setNewVolMultiplier] = useState<number>(12);
  const [newSatuanBiaya, setNewSatuanBiaya] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    const initial = getRkkdPagus().ADD;
    setPaguAdd(initial);
    setPaguInputVal(initial);

    const handleSync = () => {
      const current = getRkkdPagus().ADD;
      setPaguAdd(current);
    };
    window.addEventListener("rkkd_pagu_updated", handleSync);
    return () => window.removeEventListener("rkkd_pagu_updated", handleSync);
  }, []);

  useEffect(() => {
    if (mounted) {
      updateRkkdPagu("ADD", paguAdd);
    }
  }, [paguAdd, items, mounted]);

  const handleSavePagu = () => {
    if (paguInputVal > 0) {
      setPaguAdd(paguInputVal);
      updateRkkdPagu("ADD", paguInputVal);
    }
    setIsEditingPagu(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setNewKategori("A. Penghasilan Tetap Kepala Desa dan Perangkat Desa");
    setNewNamaKegiatan("");
    setNewVolCount(1);
    setNewVolMultiplier(12);
    setNewSatuanBiaya(0);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RkkdAddItem) => {
    setEditingItem(item);
    setNewKategori(item.kategoriGroup);
    setNewNamaKegiatan(item.namaKegiatan);
    setNewVolCount(item.volCount);
    setNewVolMultiplier(item.volMultiplier);
    setNewSatuanBiaya(item.satuanBiaya);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus item RKKD ADD ini?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNamaKegiatan || !newSatuanBiaya) return;

    let bidangNo = "1";
    let bidangName = "PENYELENGGARAAN PEMERINTAHAN DESA";
    let subBidangName = "PENYELENGGARAAN BELANJA SILTAP, TUNJANGAN DAN OPERASIONAL PEMERINTAHAN DESA";

    if (newKategori.includes("Posyandu") || newKategori.includes("Guru Ngaji")) {
      bidangNo = "2";
      bidangName = "PELAKSANAAN PEMBANGUNAN DESA";
      subBidangName = newKategori.includes("Posyandu") ? "KESEHATAN" : "KEBUDAYAAN DAN KEAGAMAAN";
    } else if (newKategori.includes("Linmas")) {
      bidangNo = "3";
      bidangName = "BIDANG PEMBINAAN KEMASYARAKATAN";
      subBidangName = "KETENTRAMAN, KETERTIBAN UMUM DAN PERLINDUNGAN MASYARAKAT";
    }

    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? {
        ...item,
        bidangNo,
        bidangName,
        subBidangName,
        kategoriGroup: newKategori,
        namaKegiatan: newNamaKegiatan,
        volCount: Number(newVolCount) || 1,
        volMultiplier: Number(newVolMultiplier) || 12,
        satuanBiaya: Number(newSatuanBiaya) || 0
      } : item));
    } else {
      const newItem: RkkdAddItem = {
        id: `add-${Date.now()}`,
        bidangNo,
        bidangName,
        subBidangName,
        kategoriGroup: newKategori,
        namaKegiatan: newNamaKegiatan,
        volCount: Number(newVolCount) || 1,
        volMultiplier: Number(newVolMultiplier) || 12,
        satuanBiaya: Number(newSatuanBiaya) || 0,
        sumberDana: "ADD"
      };
      setItems(prev => [...prev, newItem]);
    }

    setIsModalOpen(false);
  };

  const totalAnggaran = items.reduce((acc, curr) => acc + (curr.volCount * curr.volMultiplier * curr.satuanBiaya), 0);
  const sisaPagu = paguAdd - totalAnggaran;
  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

  const categories = Array.from(new Set(items.map(i => i.kategoriGroup)));

  const filteredItems = items.filter(i => {
    if (selectedCategory !== "ALL" && i.kategoriGroup !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = i.namaKegiatan.toLowerCase().includes(q);
      const matchKat = i.kategoriGroup.toLowerCase().includes(q);
      const matchSub = i.subBidangName.toLowerCase().includes(q);
      if (!matchName && !matchKat && !matchSub) return false;
    }
    return true;
  });

  const renderAddDocument = (isPortal = false) => (
    <div
      id={isPortal ? "rkkd-add-print-portal" : "rkkd-add-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative"
      style={{
        width: "330.2mm",
        minHeight: "215.9mm",
        padding: "15mm 15mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "10pt",
        lineHeight: "1.3"
      }}
    >
      <div className="text-center font-extrabold text-[12pt] mb-4 uppercase tracking-wide leading-snug">
        <div>RENCANA KEGIATAN KERJA DESA (RKKD)</div>
        <div>PENGGUNAAN DANA ALOKASI DANA DESA TAHUN ANGGARAN 2026-INDIKATIF</div>
        <div>DESA CIMANGGU I KECAMATAN CIBUNGBULANG KABUPATEN BOGOR</div>
      </div>

      <div className="flex justify-between items-center text-[10pt] font-extrabold mb-3 bg-yellow-100 p-2 border border-black">
        <div>Pagu ADD: Rp {formatRupiah(paguAdd)}</div>
        <div>Total Penggunaan: Rp {formatRupiah(totalAnggaran)}</div>
        <div className={sisaPagu === 0 ? "text-emerald-800" : "text-rose-800"}>Sisa: Rp {formatRupiah(sisaPagu)}</div>
      </div>

      <table className="w-full border-collapse border border-black text-[9pt] table-fixed mb-6">
        <thead>
          <tr className="bg-slate-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1.5 w-[35px]" rowSpan={2}>NO</th>
            <th className="border border-black p-1.5 w-[140px]" rowSpan={2}>BIDANG</th>
            <th className="border border-black p-1.5 w-[140px]" rowSpan={2}>SUB BIDANG</th>
            <th className="border border-black p-1.5 text-center" rowSpan={2}>JENIS KEGIATAN</th>
            <th className="border border-black p-1 text-center" colSpan={2}>BIAYA</th>
            <th className="border border-black p-1 text-center" colSpan={2}>SUMBER DANA ADD</th>
            <th className="border border-black p-1.5 w-[120px]" rowSpan={2}>JUMLAH (Rp)</th>
          </tr>
          <tr className="bg-slate-200 font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1 w-[80px]">VOLUME</th>
            <th className="border border-black p-1 w-[90px]">SATUAN</th>
            <th className="border border-black p-1 w-[100px]">TAHAP I (50%)</th>
            <th className="border border-black p-1 w-[100px]">TAHAP II (50%)</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const catItems = items.filter(i => i.kategoriGroup === cat);
            const catTotal = catItems.reduce((acc, curr) => acc + (curr.volCount * curr.volMultiplier * curr.satuanBiaya), 0);
            const firstItem = catItems[0];
            if (!firstItem) return null;

            return (
              <React.Fragment key={cat}>
                <tr className="bg-emerald-50 font-bold border-b border-black">
                  <td className="border border-black p-1 text-center font-bold">{firstItem.bidangNo}</td>
                  <td className="border border-black p-1 text-[8.5pt] uppercase font-bold">{firstItem.bidangName}</td>
                  <td className="border border-black p-1 text-[8.5pt] font-semibold">{firstItem.subBidangName}</td>
                  <td className="border border-black p-1 font-extrabold text-slate-900" colSpan={5}>
                    {cat}
                  </td>
                  <td className="border border-black p-1 text-right font-mono font-bold">{formatRupiah(catTotal)}</td>
                </tr>

                {catItems.map((item) => {
                  const itemTotal = item.volCount * item.volMultiplier * item.satuanBiaya;
                  const tahap = itemTotal / 2;

                  return (
                    <tr key={item.id} className="border-b border-black h-[28px]">
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1"></td>
                      <td className="border border-black p-1 pl-4 font-medium">{item.namaKegiatan}</td>
                      <td className="border border-black p-1 text-center font-mono">
                        {item.volCount > 1 ? `${item.volCount} x ` : ""}{item.volMultiplier}
                      </td>
                      <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(item.satuanBiaya)}</td>
                      <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(tahap)}</td>
                      <td className="border border-black p-1 text-right font-mono pr-2">{formatRupiah(tahap)}</td>
                      <td className="border border-black p-1 text-right font-mono font-bold pr-2">{formatRupiah(itemTotal)}</td>
                    </tr>
                  );
                })}

                <tr className="bg-amber-100 font-extrabold border-b border-black text-[9.5pt]">
                  <td className="border border-black p-1 text-right font-bold" colSpan={8}>
                    Jumlah {cat.split(".")[0] || ""} :
                  </td>
                  <td className="border border-black p-1 text-right font-mono text-emerald-950 font-black">{formatRupiah(catTotal)}</td>
                </tr>
              </React.Fragment>
            );
          })}

          <tr className="bg-emerald-600 text-white font-black text-[11pt] border-b border-black">
            <td className="border border-black p-2 text-center uppercase" colSpan={8}>
              TOTAL KESELURUHAN RKKD ADD
            </td>
            <td className="border border-black p-2 text-right font-mono pr-2 font-black">{formatRupiah(totalAnggaran)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CSS PRINT RULES */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #rkkd-add-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #rkkd-add-print-mount-root {
            display: block !important;
            visibility: visible !important;
          }

          #rkkd-add-print-portal {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #rkkd-add-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
            box-sizing: border-box !important;
          }

          #rkkd-add-print-portal table {
            display: table !important;
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }

          #rkkd-add-print-portal tr {
            display: table-row !important;
          }

          #rkkd-add-print-portal td, #rkkd-add-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
            font-size: 7.5pt !important;
            padding: 3px 4px !important;
            word-break: break-word !important;
          }

          @page {
            size: 215.9mm 330.2mm portrait;
            margin: 5mm 6mm;
          }
        }
      `}} />

      {/* TOP SUMMARY CARDS FOR RKKD ADD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        {/* PAGU CARD WITH MANUAL EDIT */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-xl border border-blue-500/30 relative">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100 block">Pagu RKKD ADD 2026</span>
            <button
              onClick={() => {
                setPaguInputVal(paguAdd);
                setIsEditingPagu(true);
              }}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Edit Pagu Manually"
            >
              <Pencil size={13} />
              <span>Input Pagu</span>
            </button>
          </div>
          
          {isEditingPagu ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-bold text-sm">Rp</span>
              <input
                type="number"
                value={paguInputVal || ""}
                onChange={(e) => setPaguInputVal(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-white text-slate-900 font-mono font-bold text-lg focus:outline-none"
                placeholder="Masukkan nilai pagu"
              />
              <button
                onClick={handleSavePagu}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
              >
                <Save size={14} />
              </button>
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(paguAdd)}</div>
          )}
          
          <span className="text-[11px] text-blue-100 mt-2 block">Alokasi Dana Desa Kabupaten (Dapat Diubah)</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-xl border border-emerald-500/30">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 block mb-1">Total Penggunaan RKKD ADD</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalAnggaran)}</div>
          <span className="text-[11px] text-emerald-100 mt-2 block">Otomatis Terakumulasi dari Rincian Item</span>
        </div>

        <div className={`rounded-3xl p-5 text-white shadow-xl border ${
          sisaPagu === 0 
            ? "bg-slate-900 border-slate-700" 
            : sisaPagu < 0 
              ? "bg-gradient-to-br from-rose-600 to-red-700 border-rose-500/30" 
              : "bg-gradient-to-br from-amber-600 to-orange-700 border-amber-500/30"
        }`}>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1">Sisa / Balance Pagu ADD</span>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(sisaPagu)}</div>
          <span className="text-[11px] text-slate-200 mt-2 block font-semibold">
            {sisaPagu === 0 ? "✅ Klop Balance 100%!" : sisaPagu < 0 ? "🚨 Over Budget / Defisit!" : "⚠️ Masih Ada Sisa Anggaran"}
          </span>
        </div>
      </div>

      {/* DYNAMIC BALANCE STATUS ALERT BANNERS */}
      <div className="no-print">
        {sisaPagu < 0 ? (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-rose-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-rose-900 text-sm">🚨 PERINGATAN KRITIS: Penggunaan Anggaran Melebihi Pagu (Defisit)!</h4>
                <p className="text-xs text-rose-700 font-medium mt-0.5">
                  Total rincian penggunaan (Rp {formatRupiah(totalAnggaran)}) melebihi batas pagu (Rp {formatRupiah(paguAdd)}). Terjadi defisit sebesar <span className="font-mono font-bold text-rose-900">Rp {formatRupiah(Math.abs(sisaPagu))}</span>. Mohon sesuaikan item kegiatan atau perbarui Pagu.
                </p>
              </div>
            </div>
          </div>
        ) : sisaPagu > 0 ? (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-amber-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-amber-900 text-sm">⚠️ PERINGATAN: Penggunaan Anggaran Belum Balance!</h4>
                <p className="text-xs text-amber-800 font-medium mt-0.5">
                  Masih terdapat sisa alokasi pagu anggaran sebesar <span className="font-mono font-bold text-amber-950">Rp {formatRupiah(sisaPagu)}</span> yang belum dimasukkan ke rincian kegiatan RKKD ADD.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-emerald-900 text-sm">✅ ANGGARAN RKKD ADD BALANCE 100%!</h4>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">
                  Seluruh alokasi pagu anggaran (Rp {formatRupiah(paguAdd)}) telah terserap secara presisi dan sempurna.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACTION & CONTROL BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table size={14} className={viewMode === "table" ? "text-blue-600" : ""} />
              <span>Tabel Data Interaktif</span>
            </button>
            <button
              onClick={() => setViewMode("print-preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "print-preview"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={14} className={viewMode === "print-preview" ? "text-amber-600" : ""} />
              <span>Preview Format Cetak (F4)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Plus size={16} />
            <span>Tambah Item ADD</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer min-h-[40px]"
          >
            <Printer size={16} />
            <span>Cetak Dokumen RKKD ADD (F4 Landscape)</span>
          </button>
        </div>
      </div>

      {/* FRONT VIEW: INTERACTIVE DATA TABLE VS PRINT PREVIEW */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden no-print">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari uraian kegiatan RKKD ADD..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-blue-500 max-w-xs"
              >
                <option value="ALL">Semua Kategori ({items.length} Item)</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5 min-w-[200px]">Sub Bidang / Kategori Group</th>
                  <th className="p-3.5 min-w-[220px]">Jenis Kegiatan / Uraian</th>
                  <th className="p-3.5 text-center min-w-[120px]">Volume & Satuan</th>
                  <th className="p-3.5 text-right min-w-[130px]">Biaya Satuan (Rp)</th>
                  <th className="p-3.5 text-right min-w-[130px]">Tahap I (50%)</th>
                  <th className="p-3.5 text-right min-w-[130px]">Tahap II (50%)</th>
                  <th className="p-3.5 text-right min-w-[150px]">Total Jumlah (Rp)</th>
                  <th className="p-3.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                      Tidak ada data kegiatan RKKD ADD yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    const total = item.volCount * item.volMultiplier * item.satuanBiaya;
                    const t50 = total / 2;
                    return (
                      <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3.5 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3.5">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
                            {item.kategoriGroup}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{item.namaKegiatan}</td>
                        <td className="p-3.5 text-center font-mono font-semibold">
                          {item.volCount > 1 ? `${item.volCount} x ` : ""}{item.volMultiplier}
                        </td>
                        <td className="p-3.5 text-right font-mono font-medium">{formatRupiah(item.satuanBiaya)}</td>
                        <td className="p-3.5 text-right font-mono text-slate-600">{formatRupiah(t50)}</td>
                        <td className="p-3.5 text-right font-mono text-slate-600">{formatRupiah(t50)}</td>
                        <td className="p-3.5 text-right font-mono font-black text-emerald-600 text-sm">
                          Rp {formatRupiah(total)}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 border border-amber-200 transition-all cursor-pointer"
                              title="Edit Item RKKD"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 transition-all cursor-pointer"
                              title="Hapus Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-extrabold text-xs">
                  <td colSpan={7} className="p-3.5 text-right uppercase tracking-wider">
                    Total Keseluruhan Penggunaan RKKD ADD:
                  </td>
                  <td className="p-3.5 text-right font-mono text-emerald-400 text-sm font-black">
                    Rp {formatRupiah(totalAnggaran)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
          <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            --- Preview Dokumen Resmi RKKD ADD (Kertas F4 Cambria) ---
          </span>
          {renderAddDocument(false)}
        </div>
      )}

      {/* CREATE & EDIT MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                {editingItem ? (
                  <>
                    <Pencil size={18} className="text-amber-600" />
                    <span>Edit Rincian Kegiatan RKKD ADD</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} className="text-emerald-600" />
                    <span>Tambah Rincian Kegiatan RKKD ADD</span>
                  </>
                )}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Kategori Group RKKD ADD</label>
                <select
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="A. Penghasilan Tetap Kepala Desa dan Perangkat Desa">A. Penghasilan Tetap Kades & Perangkat</option>
                  <option value="B. Penyediaan Operasional Pemerintah Desa">B. Penyediaan Operasional Pemdes</option>
                  <option value="C. Penyediaan Tunjangan BPD">C. Tunjangan BPD</option>
                  <option value="D. Penyediaan Operasional BPD">D. Operasional BPD</option>
                  <option value="E. Penyediaan Insentif RT RW">E. Insentif RT & RW</option>
                  <option value="F. Insentif Posyandu (ADD Khusus)">F. Insentif Posyandu (ADD Khusus)</option>
                  <option value="H. Insentif Guru Ngaji">H. Insentif Guru Ngaji</option>
                  <option value="G. Insentif Linmas Desa">G. Insentif Linmas Desa</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Kegiatan / Uraian</label>
                <input
                  type="text"
                  required
                  value={newNamaKegiatan}
                  onChange={(e) => setNewNamaKegiatan(e.target.value)}
                  placeholder="Contoh: Insentif Kader Kesehatan / Staf Tambahan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah (Orang/Unit)</label>
                  <input
                    type="number"
                    value={newVolCount}
                    onChange={(e) => setNewVolCount(Number(e.target.value))}
                    placeholder="1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pengali (Bulan/Pkt)</label>
                  <input
                    type="number"
                    value={newVolMultiplier}
                    onChange={(e) => setNewVolMultiplier(Number(e.target.value))}
                    placeholder="12"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Satuan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newSatuanBiaya || ""}
                    onChange={(e) => setNewSatuanBiaya(Number(e.target.value))}
                    placeholder="500000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Total Est. Anggaran:</span>
                  <span className="font-mono text-emerald-600 font-black">
                    Rp {formatRupiah(newVolCount * newVolMultiplier * newSatuanBiaya)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Tahap I (50%) & Tahap II (50%):</span>
                  <span className="font-mono">
                    Rp {formatRupiah((newVolCount * newVolMultiplier * newSatuanBiaya) / 2)} / Tahap
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {editingItem ? <Save size={14} /> : <Plus size={14} />}
                  <span>{editingItem ? "Simpan Perubahan" : "Simpan Ke Tabel ADD"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT CONTAINER */}
      <SafePrintPortal portalId="rkkd-add-print-mount-root">
        {renderAddDocument(true)}
      </SafePrintPortal>
    </div>
  );
}
