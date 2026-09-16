"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Printer, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  RefreshCw, 
  Search, 
  Calculator, 
  FileSpreadsheet, 
  Hammer, 
  Wrench, 
  Layers, 
  TrendingUp,
  Sparkles,
  Info,
  SlidersHorizontal,
  FolderOpen
} from "lucide-react";
import { SafePrintPortal } from "./SafePrintPortal";

export interface AhspItemKomponen {
  id: string;
  kategori: "UPAH" | "BAHAN" | "ALAT";
  uraian: string;
  satuan: string;
  koefisien: number;
  hargaSatuan: number;
}

export interface AhspPekerjaan {
  id: string;
  kodeAhsp: string;
  namaPekerjaan: string;
  satuanPekerjaan: string;
  kategoriGrup: "TPT & DPT" | "Betonisasi Jalan" | "Aspal & Hotmix" | "Paving Block" | "Drainase & U-Ditch" | "Tanah & Agregat" | "Bangunan & Finishing";
  overheadPercent: number; // e.g. 10 or 15
  komponen: AhspItemKomponen[];
}

interface CyberPlanAhspTabProps {
  onBack?: () => void;
}

function formatRupiah(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return Math.round(val).toLocaleString("id-ID");
}

// Full Standard PUPR AHSP Data (Permen PUPR & AHSP Bina Marga / Cipta Karya / SNI 2026)
const defaultAhspList: AhspPekerjaan[] = [
  // -------------------------------------------------------------
  // 1. PEKERJAAN TPT & DPT (TEMBOK & DINDING PENAHAN TANAH)
  // -------------------------------------------------------------
  {
    id: "ahsp-tpt-1",
    kodeAhsp: "A.3.2.1.1",
    namaPekerjaan: "1 m3 Pasangan Batu Kali (1 SP : 4 PP) - TPT Desa Standar",
    satuanPekerjaan: "m3",
    kategoriGrup: "TPT & DPT",
    overheadPercent: 10,
    komponen: [
      { id: "k-tpt1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 1.500, hargaSatuan: 100000 },
      { id: "k-tpt1-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.750, hargaSatuan: 130000 },
      { id: "k-tpt1-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.075, hargaSatuan: 145000 },
      { id: "k-tpt1-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.075, hargaSatuan: 150000 },
      { id: "k-tpt1-5", kategori: "BAHAN", uraian: "Batu Belah 15/20 cm", satuan: "m3", koefisien: 1.200, hargaSatuan: 280000 },
      { id: "k-tpt1-6", kategori: "BAHAN", uraian: "Semen Portland (PC 50kg)", satuan: "kg", koefisien: 163.000, hargaSatuan: 1500 },
      { id: "k-tpt1-7", kategori: "BAHAN", uraian: "Pasir Pasang", satuan: "m3", koefisien: 0.520, hargaSatuan: 240000 },
      { id: "k-tpt1-8", kategori: "ALAT", uraian: "Concrete Mixer (Molen 0.35m3)", satuan: "sewa-hari", koefisien: 0.050, hargaSatuan: 350000 }
    ]
  },
  {
    id: "ahsp-tpt-2",
    kodeAhsp: "A.3.2.1.2",
    namaPekerjaan: "1 m3 Pasangan Batu Kali (1 SP : 3 PP) - TPT / DPT Heavy Duty Air Deras",
    satuanPekerjaan: "m3",
    kategoriGrup: "TPT & DPT",
    overheadPercent: 10,
    komponen: [
      { id: "k-tpt2-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 1.500, hargaSatuan: 100000 },
      { id: "k-tpt2-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.750, hargaSatuan: 130000 },
      { id: "k-tpt2-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.075, hargaSatuan: 145000 },
      { id: "k-tpt2-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.075, hargaSatuan: 150000 },
      { id: "k-tpt2-5", kategori: "BAHAN", uraian: "Batu Belah 15/20 cm", satuan: "m3", koefisien: 1.200, hargaSatuan: 280000 },
      { id: "k-tpt2-6", kategori: "BAHAN", uraian: "Semen Portland (PC)", satuan: "kg", koefisien: 202.000, hargaSatuan: 1500 },
      { id: "k-tpt2-7", kategori: "BAHAN", uraian: "Pasir Pasang", satuan: "m3", koefisien: 0.485, hargaSatuan: 240000 },
      { id: "k-tpt2-8", kategori: "ALAT", uraian: "Concrete Mixer (Molen)", satuan: "sewa-hari", koefisien: 0.050, hargaSatuan: 350000 }
    ]
  },
  {
    id: "ahsp-tpt-3",
    kodeAhsp: "A.3.2.1.8",
    namaPekerjaan: "1 m3 Pasangan Batu Kosong (Anstamping Pondasi / TPT)",
    satuanPekerjaan: "m3",
    kategoriGrup: "TPT & DPT",
    overheadPercent: 10,
    komponen: [
      { id: "k-tpt3-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.780, hargaSatuan: 100000 },
      { id: "k-tpt3-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.390, hargaSatuan: 130000 },
      { id: "k-tpt3-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.039, hargaSatuan: 145000 },
      { id: "k-tpt3-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.039, hargaSatuan: 150000 },
      { id: "k-tpt3-5", kategori: "BAHAN", uraian: "Batu Belah 15/20 cm", satuan: "m3", koefisien: 1.200, hargaSatuan: 280000 },
      { id: "k-tpt3-6", kategori: "BAHAN", uraian: "Pasir Urug / Pasir Alas", satuan: "m3", koefisien: 0.430, hargaSatuan: 180000 }
    ]
  },
  {
    id: "ahsp-tpt-4",
    kodeAhsp: "A.3.2.1.9",
    namaPekerjaan: "1 m3 Pemasangan Bronjong Kawat (Gabion) Anyaman Pabrik / DPT Sungai",
    satuanPekerjaan: "m3",
    kategoriGrup: "TPT & DPT",
    overheadPercent: 10,
    komponen: [
      { id: "k-tpt4-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 1.500, hargaSatuan: 100000 },
      { id: "k-tpt4-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.150, hargaSatuan: 130000 },
      { id: "k-tpt4-3", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.075, hargaSatuan: 150000 },
      { id: "k-tpt4-4", kategori: "BAHAN", uraian: "Kawat Bronjong 2x1x0.5m Galvani", satuan: "unit", koefisien: 1.000, hargaSatuan: 210000 },
      { id: "k-tpt4-5", kategori: "BAHAN", uraian: "Batu Belah 15/20 cm", satuan: "m3", koefisien: 1.150, hargaSatuan: 280000 }
    ]
  },

  // -------------------------------------------------------------
  // 2. PEKERJAAN BETONISASI JALAN DESA & DPT STRUKTUR
  // -------------------------------------------------------------
  {
    id: "ahsp-beton-1",
    kodeAhsp: "A.4.1.1.4",
    namaPekerjaan: "1 m3 Membuat Beton K-125 (fc 9.8 MPa) Sub-base / Cor Dasar Jalan",
    satuanPekerjaan: "m3",
    kategoriGrup: "Betonisasi Jalan",
    overheadPercent: 10,
    komponen: [
      { id: "k-b1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 1.650, hargaSatuan: 100000 },
      { id: "k-b1-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.275, hargaSatuan: 130000 },
      { id: "k-b1-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.028, hargaSatuan: 145000 },
      { id: "k-b1-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.083, hargaSatuan: 150000 },
      { id: "k-b1-5", kategori: "BAHAN", uraian: "Semen Portland (PC)", satuan: "kg", koefisien: 276.000, hargaSatuan: 1500 },
      { id: "k-b1-6", kategori: "BAHAN", uraian: "Pasir Beton", satuan: "kg", koefisien: 828.000, hargaSatuan: 180 },
      { id: "k-b1-7", kategori: "BAHAN", uraian: "Kerikil / Split 2/3 cm", satuan: "kg", koefisien: 1012.000, hargaSatuan: 220 },
      { id: "k-b1-8", kategori: "BAHAN", uraian: "Air", satuan: "liter", koefisien: 215.000, hargaSatuan: 50 },
      { id: "k-b1-9", kategori: "ALAT", uraian: "Concrete Mixer (Molen)", satuan: "sewa-hari", koefisien: 0.080, hargaSatuan: 350000 }
    ]
  },
  {
    id: "ahsp-beton-2",
    kodeAhsp: "A.4.1.1.5",
    namaPekerjaan: "1 m3 Membuat Beton K-175 (fc 14.5 MPa) Slump (12±2) cm Jalan Desa",
    satuanPekerjaan: "m3",
    kategoriGrup: "Betonisasi Jalan",
    overheadPercent: 10,
    komponen: [
      { id: "k-b2-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 1.650, hargaSatuan: 100000 },
      { id: "k-b2-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.275, hargaSatuan: 130000 },
      { id: "k-b2-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.028, hargaSatuan: 145000 },
      { id: "k-b2-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.083, hargaSatuan: 150000 },
      { id: "k-b2-5", kategori: "BAHAN", uraian: "Semen Portland (PC)", satuan: "kg", koefisien: 326.000, hargaSatuan: 1500 },
      { id: "k-b2-6", kategori: "BAHAN", uraian: "Pasir Beton", satuan: "kg", koefisien: 760.000, hargaSatuan: 180 },
      { id: "k-b2-7", kategori: "BAHAN", uraian: "Kerikil / Split 2/3 cm", satuan: "kg", koefisien: 1029.000, hargaSatuan: 220 },
      { id: "k-b2-8", kategori: "BAHAN", uraian: "Air", satuan: "liter", koefisien: 215.000, hargaSatuan: 50 },
      { id: "k-b2-9", kategori: "ALAT", uraian: "Concrete Mixer (Molen)", satuan: "sewa-hari", koefisien: 0.080, hargaSatuan: 350000 }
    ]
  },
  {
    id: "ahsp-beton-3",
    kodeAhsp: "A.4.1.1.6",
    namaPekerjaan: "1 m3 Membuat Beton K-225 (fc 19.3 MPa) Jalan Utama Desa / Mutu Sedang",
    satuanPekerjaan: "m3",
    kategoriGrup: "Betonisasi Jalan",
    overheadPercent: 10,
    komponen: [
      { id: "k-b3-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 1.650, hargaSatuan: 100000 },
      { id: "k-b3-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.275, hargaSatuan: 130000 },
      { id: "k-b3-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.028, hargaSatuan: 145000 },
      { id: "k-b3-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.083, hargaSatuan: 150000 },
      { id: "k-b3-5", kategori: "BAHAN", uraian: "Semen Portland (PC)", satuan: "kg", koefisien: 371.000, hargaSatuan: 1500 },
      { id: "k-b3-6", kategori: "BAHAN", uraian: "Pasir Beton", satuan: "kg", koefisien: 698.000, hargaSatuan: 180 },
      { id: "k-b3-7", kategori: "BAHAN", uraian: "Kerikil / Split 2/3 cm", satuan: "kg", koefisien: 1047.000, hargaSatuan: 220 },
      { id: "k-b3-8", kategori: "BAHAN", uraian: "Air", satuan: "liter", koefisien: 215.000, hargaSatuan: 50 },
      { id: "k-b3-9", kategori: "ALAT", uraian: "Concrete Mixer (Molen)", satuan: "sewa-hari", koefisien: 0.080, hargaSatuan: 350000 }
    ]
  },
  {
    id: "ahsp-beton-4",
    kodeAhsp: "A.4.1.1.7",
    namaPekerjaan: "1 m3 Membuat Beton K-300 (fc 24.9 MPa) Rigid Pavement Heavy Duty",
    satuanPekerjaan: "m3",
    kategoriGrup: "Betonisasi Jalan",
    overheadPercent: 10,
    komponen: [
      { id: "k-b4-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 1.650, hargaSatuan: 100000 },
      { id: "k-b4-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.275, hargaSatuan: 130000 },
      { id: "k-b4-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.028, hargaSatuan: 145000 },
      { id: "k-b4-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.083, hargaSatuan: 150000 },
      { id: "k-b4-5", kategori: "BAHAN", uraian: "Semen Portland (PC)", satuan: "kg", koefisien: 413.000, hargaSatuan: 1500 },
      { id: "k-b4-6", kategori: "BAHAN", uraian: "Pasir Beton", satuan: "kg", koefisien: 681.000, hargaSatuan: 180 },
      { id: "k-b4-7", kategori: "BAHAN", uraian: "Kerikil / Split 2/3 cm", satuan: "kg", koefisien: 1021.000, hargaSatuan: 220 },
      { id: "k-b4-8", kategori: "BAHAN", uraian: "Air", satuan: "liter", koefisien: 215.000, hargaSatuan: 50 },
      { id: "k-b4-9", kategori: "ALAT", uraian: "Concrete Mixer (Molen)", satuan: "sewa-hari", koefisien: 0.080, hargaSatuan: 350000 }
    ]
  },
  {
    id: "ahsp-besi-1",
    kodeAhsp: "A.4.1.1.1",
    namaPekerjaan: "1 kg Pembesian Besi Beton Polos / Ulir DPT & Cor Jalan",
    satuanPekerjaan: "kg",
    kategoriGrup: "Betonisasi Jalan",
    overheadPercent: 10,
    komponen: [
      { id: "k-bs1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.007, hargaSatuan: 100000 },
      { id: "k-bs1-2", kategori: "UPAH", uraian: "Tukang Besi", satuan: "OH", koefisien: 0.007, hargaSatuan: 130000 },
      { id: "k-bs1-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.0007, hargaSatuan: 145000 },
      { id: "k-bs1-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.0004, hargaSatuan: 150000 },
      { id: "k-bs1-5", kategori: "BAHAN", uraian: "Besi Beton Polos / Ulir", satuan: "kg", koefisien: 1.050, hargaSatuan: 14000 },
      { id: "k-bs1-6", kategori: "BAHAN", uraian: "Kawat Bindrat / Bendrat", satuan: "kg", koefisien: 0.015, hargaSatuan: 25000 }
    ]
  },
  {
    id: "ahsp-bekisting-1",
    kodeAhsp: "A.4.1.1.22",
    namaPekerjaan: "1 m2 Bekisting Dinding / TPT / Balok Cor Kayu Terentang",
    satuanPekerjaan: "m2",
    kategoriGrup: "Betonisasi Jalan",
    overheadPercent: 10,
    komponen: [
      { id: "k-bk1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.660, hargaSatuan: 100000 },
      { id: "k-bk1-2", kategori: "UPAH", uraian: "Tukang Kayu", satuan: "OH", koefisien: 0.330, hargaSatuan: 130000 },
      { id: "k-bk1-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.033, hargaSatuan: 145000 },
      { id: "k-bk1-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.033, hargaSatuan: 150000 },
      { id: "k-bk1-5", kategori: "BAHAN", uraian: "Kayu Bekisting Kelas III", satuan: "m3", koefisien: 0.040, hargaSatuan: 2100000 },
      { id: "k-bk1-6", kategori: "BAHAN", uraian: "Paku 5-10 cm", satuan: "kg", koefisien: 0.400, hargaSatuan: 22000 },
      { id: "k-bk1-7", kategori: "BAHAN", uraian: "Minyak Bekisting", satuan: "liter", koefisien: 0.200, hargaSatuan: 18000 }
    ]
  },
  {
    id: "ahsp-wiremesh-1",
    kodeAhsp: "A.4.1.1.26",
    namaPekerjaan: "1 m2 Pemasangan Wiremesh M6 Single Layer (Beton Jalan Desa)",
    satuanPekerjaan: "m2",
    kategoriGrup: "Betonisasi Jalan",
    overheadPercent: 10,
    komponen: [
      { id: "k-wm1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.050, hargaSatuan: 100000 },
      { id: "k-wm1-2", kategori: "UPAH", uraian: "Tukang Besi", satuan: "OH", koefisien: 0.020, hargaSatuan: 130000 },
      { id: "k-wm1-3", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.005, hargaSatuan: 150000 },
      { id: "k-wm1-4", kategori: "BAHAN", uraian: "Wiremesh M6 Roll/Lembar", satuan: "m2", koefisien: 1.050, hargaSatuan: 48000 },
      { id: "k-wm1-5", kategori: "BAHAN", uraian: "Kawat Bindrat", satuan: "kg", koefisien: 0.050, hargaSatuan: 25000 }
    ]
  },

  // -------------------------------------------------------------
  // 3. PEKERJAAN ASPAL (HOTMIX, LAPEN, TELFORD)
  // -------------------------------------------------------------
  {
    id: "ahsp-telford-1",
    kodeAhsp: "B.01.1",
    namaPekerjaan: "1 m3 Lapisan Pondasi Batu Telford (Batu Belah 15/20 cm + Batu Pecah 5/7)",
    satuanPekerjaan: "m3",
    kategoriGrup: "Aspal & Hotmix",
    overheadPercent: 10,
    komponen: [
      { id: "k-tf1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.600, hargaSatuan: 100000 },
      { id: "k-tf1-2", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.060, hargaSatuan: 150000 },
      { id: "k-tf1-3", kategori: "BAHAN", uraian: "Batu Belah 15/20 cm", satuan: "m3", koefisien: 1.150, hargaSatuan: 280000 },
      { id: "k-tf1-4", kategori: "BAHAN", uraian: "Batu Pecah 5/7 cm (Pengunci)", satuan: "m3", koefisien: 0.150, hargaSatuan: 290000 },
      { id: "k-tf1-5", kategori: "BAHAN", uraian: "Pasir Urug", satuan: "m3", koefisien: 0.100, hargaSatuan: 180000 },
      { id: "k-tf1-6", kategori: "ALAT", uraian: "Smooth Drum Roller 6-8 Ton", satuan: "sewa-hari", koefisien: 0.020, hargaSatuan: 1200000 }
    ]
  },
  {
    id: "ahsp-lapen-1",
    kodeAhsp: "B.02.1",
    namaPekerjaan: "1 m2 Lapisan Penetrasi Macadam (Lapen Asphalt) Tebal 5 cm",
    satuanPekerjaan: "m2",
    kategoriGrup: "Aspal & Hotmix",
    overheadPercent: 10,
    komponen: [
      { id: "k-lp1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.120, hargaSatuan: 100000 },
      { id: "k-lp1-2", kategori: "UPAH", uraian: "Tukang Aspal", satuan: "OH", koefisien: 0.040, hargaSatuan: 130000 },
      { id: "k-lp1-3", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.012, hargaSatuan: 150000 },
      { id: "k-lp1-4", kategori: "BAHAN", uraian: "Batu Pecah 3/5 cm", satuan: "m3", koefisien: 0.050, hargaSatuan: 290000 },
      { id: "k-lp1-5", kategori: "BAHAN", uraian: "Batu Pecah 2/3 cm", satuan: "m3", koefisien: 0.015, hargaSatuan: 300000 },
      { id: "k-lp1-6", kategori: "BAHAN", uraian: "Pasir Kerap / Abu Batu", satuan: "m3", koefisien: 0.005, hargaSatuan: 230000 },
      { id: "k-lp1-7", kategori: "BAHAN", uraian: "Aspal Bitumen Pen 60/70", satuan: "kg", koefisien: 4.500, hargaSatuan: 16500 },
      { id: "k-lp1-8", kategori: "ALAT", uraian: "Mesin Penyemprot Aspal / Kettle", satuan: "sewa-hari", koefisien: 0.005, hargaSatuan: 400000 },
      { id: "k-lp1-9", kategori: "ALAT", uraian: "Mesin Stoom Roller 6-8 Ton", satuan: "sewa-hari", koefisien: 0.005, hargaSatuan: 1200000 }
    ]
  },
  {
    id: "ahsp-tackcoat-1",
    kodeAhsp: "B.03.1",
    namaPekerjaan: "1 m2 Tack Coat / Prime Coat (Lapis Resap Pengikat Emulsi Aspal)",
    satuanPekerjaan: "m2",
    kategoriGrup: "Aspal & Hotmix",
    overheadPercent: 10,
    komponen: [
      { id: "k-tc1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.012, hargaSatuan: 100000 },
      { id: "k-tc1-2", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.0012, hargaSatuan: 150000 },
      { id: "k-tc1-3", kategori: "BAHAN", uraian: "Aspal Emulsi RS-1 / SS-1", satuan: "kg", koefisien: 0.500, hargaSatuan: 18500 },
      { id: "k-tc1-4", kategori: "BAHAN", uraian: "Minyak Tanah / Solvent", satuan: "liter", koefisien: 0.150, hargaSatuan: 14000 },
      { id: "k-tc1-5", kategori: "ALAT", uraian: "Asphalt Distributor", satuan: "sewa-hari", koefisien: 0.001, hargaSatuan: 1500000 }
    ]
  },
  {
    id: "ahsp-hotmix-1",
    kodeAhsp: "B.04.1",
    namaPekerjaan: "1 Ton Aspal Hotmix AC-WC / AC-BC (Paving Machine + Roller Tandem)",
    satuanPekerjaan: "Ton",
    kategoriGrup: "Aspal & Hotmix",
    overheadPercent: 10,
    komponen: [
      { id: "k-hm1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.180, hargaSatuan: 100000 },
      { id: "k-hm1-2", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.018, hargaSatuan: 150000 },
      { id: "k-hm1-3", kategori: "BAHAN", uraian: "Campuran Aspal Hotmix AC-WC", satuan: "Ton", koefisien: 1.020, hargaSatuan: 1450000 },
      { id: "k-hm1-4", kategori: "ALAT", uraian: "Asphalt Paver Finisher", satuan: "sewa-jam", koefisien: 0.004, hargaSatuan: 450000 },
      { id: "k-hm1-5", kategori: "ALAT", uraian: "Tandem Roller", satuan: "sewa-jam", koefisien: 0.004, hargaSatuan: 350000 },
      { id: "k-hm1-6", kategori: "ALAT", uraian: "Pneumatic Tire Roller (PTR)", satuan: "sewa-jam", koefisien: 0.004, hargaSatuan: 400000 }
    ]
  },

  // -------------------------------------------------------------
  // 4. PEKERJAAN PAVING BLOCK
  // -------------------------------------------------------------
  {
    id: "ahsp-paving-1",
    kodeAhsp: "B.05.1",
    namaPekerjaan: "1 m2 Pemasangan Paving Block K-300 Tebal 8 cm (Jalan Lingkungan / Gang)",
    satuanPekerjaan: "m2",
    kategoriGrup: "Paving Block",
    overheadPercent: 10,
    komponen: [
      { id: "k-pv1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.350, hargaSatuan: 100000 },
      { id: "k-pv1-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.175, hargaSatuan: 130000 },
      { id: "k-pv1-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.0175, hargaSatuan: 145000 },
      { id: "k-pv1-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.0175, hargaSatuan: 150000 },
      { id: "k-pv1-5", kategori: "BAHAN", uraian: "Paving Block K-300 t=8cm (Pres Pabrik)", satuan: "m2", koefisien: 1.020, hargaSatuan: 95000 },
      { id: "k-pv1-6", kategori: "BAHAN", uraian: "Pasir Alas / Pasir Urug", satuan: "m3", koefisien: 0.050, hargaSatuan: 180000 },
      { id: "k-pv1-7", kategori: "ALAT", uraian: "Stamper Paving Plate Compactor", satuan: "sewa-hari", koefisien: 0.020, hargaSatuan: 250000 }
    ]
  },
  {
    id: "ahsp-paving-2",
    kodeAhsp: "B.05.2",
    namaPekerjaan: "1 m2 Pemasangan Paving Block K-200 Tebal 6 cm (Halaman / Pedestrian)",
    satuanPekerjaan: "m2",
    kategoriGrup: "Paving Block",
    overheadPercent: 10,
    komponen: [
      { id: "k-pv2-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.300, hargaSatuan: 100000 },
      { id: "k-pv2-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.150, hargaSatuan: 130000 },
      { id: "k-pv2-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.015, hargaSatuan: 145000 },
      { id: "k-pv2-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.015, hargaSatuan: 150000 },
      { id: "k-pv2-5", kategori: "BAHAN", uraian: "Paving Block K-200 t=6cm", satuan: "m2", koefisien: 1.020, hargaSatuan: 75000 },
      { id: "k-pv2-6", kategori: "BAHAN", uraian: "Pasir Alas", satuan: "m3", koefisien: 0.040, hargaSatuan: 180000 },
      { id: "k-pv2-7", kategori: "ALAT", uraian: "Stamper Paving Plate Compactor", satuan: "sewa-hari", koefisien: 0.020, hargaSatuan: 250000 }
    ]
  },

  // -------------------------------------------------------------
  // 5. DRAINASE, SALURAN & BUIS BETON
  // -------------------------------------------------------------
  {
    id: "ahsp-uditch-1",
    kodeAhsp: "D.01.1",
    namaPekerjaan: "1 m' Pemasangan Saluran U-Ditch Precast 40x40 cm + Cover HD",
    satuanPekerjaan: "m'",
    kategoriGrup: "Drainase & U-Ditch",
    overheadPercent: 10,
    komponen: [
      { id: "k-ud1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.450, hargaSatuan: 100000 },
      { id: "k-ud1-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.150, hargaSatuan: 130000 },
      { id: "k-ud1-3", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.045, hargaSatuan: 150000 },
      { id: "k-ud1-4", kategori: "BAHAN", uraian: "U-Ditch Precast 40x40 cm", satuan: "m'", koefisien: 1.020, hargaSatuan: 380000 },
      { id: "k-ud1-5", kategori: "BAHAN", uraian: "Cover U-Ditch 40 cm Heavy Duty", satuan: "m'", koefisien: 1.020, hargaSatuan: 190000 },
      { id: "k-ud1-6", kategori: "BAHAN", uraian: "Pasir Alas", satuan: "m3", koefisien: 0.030, hargaSatuan: 180000 },
      { id: "k-ud1-7", kategori: "BAHAN", uraian: "Semen PC (Mortar Joint)", satuan: "kg", koefisien: 2.500, hargaSatuan: 1500 },
      { id: "k-ud1-8", kategori: "ALAT", uraian: "Tripod Crane / Chain Block 2 Ton", satuan: "sewa-hari", koefisien: 0.050, hargaSatuan: 300000 }
    ]
  },
  {
    id: "ahsp-buis-1",
    kodeAhsp: "D.02.1",
    namaPekerjaan: "1 m' Pemasangan Buis Beton / Gorong-Gorong Dia. 50 cm",
    satuanPekerjaan: "m'",
    kategoriGrup: "Drainase & U-Ditch",
    overheadPercent: 10,
    komponen: [
      { id: "k-bb1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.400, hargaSatuan: 100000 },
      { id: "k-bb1-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.200, hargaSatuan: 130000 },
      { id: "k-bb1-3", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.040, hargaSatuan: 150000 },
      { id: "k-bb1-4", kategori: "BAHAN", uraian: "Buis Beton Dia. 50 cm", satuan: "m'", koefisien: 1.050, hargaSatuan: 140000 },
      { id: "k-bb1-5", kategori: "BAHAN", uraian: "Semen Portland (PC)", satuan: "kg", koefisien: 5.000, hargaSatuan: 1500 },
      { id: "k-bb1-6", kategori: "BAHAN", uraian: "Pasir Pasang", satuan: "m3", koefisien: 0.015, hargaSatuan: 240000 }
    ]
  },
  {
    id: "ahsp-plester-1",
    kodeAhsp: "A.4.4.2.1",
    namaPekerjaan: "1 m2 Plesteran 1 SP : 4 PP Tebal 15 mm (Saluran / TPT / DPT)",
    satuanPekerjaan: "m2",
    kategoriGrup: "Drainase & U-Ditch",
    overheadPercent: 10,
    komponen: [
      { id: "k-pl1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.300, hargaSatuan: 100000 },
      { id: "k-pl1-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.150, hargaSatuan: 130000 },
      { id: "k-pl1-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.015, hargaSatuan: 145000 },
      { id: "k-pl1-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.015, hargaSatuan: 150000 },
      { id: "k-pl1-5", kategori: "BAHAN", uraian: "Semen Portland (PC)", satuan: "kg", koefisien: 6.240, hargaSatuan: 1500 },
      { id: "k-pl1-6", kategori: "BAHAN", uraian: "Pasir Pasang", satuan: "m3", koefisien: 0.024, hargaSatuan: 240000 }
    ]
  },

  // -------------------------------------------------------------
  // 6. PEKERJAAN TANAH & AGREGAT
  // -------------------------------------------------------------
  {
    id: "ahsp-tanah-1",
    kodeAhsp: "A.2.3.1.1",
    namaPekerjaan: "1 m3 Galian Tanah Biasa Sedalam 1 Meter",
    satuanPekerjaan: "m3",
    kategoriGrup: "Tanah & Agregat",
    overheadPercent: 10,
    komponen: [
      { id: "k-tn1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.750, hargaSatuan: 100000 },
      { id: "k-tn1-2", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.025, hargaSatuan: 150000 }
    ]
  },
  {
    id: "ahsp-tanah-2",
    kodeAhsp: "A.2.3.1.9",
    namaPekerjaan: "1 m3 Timbunan Tanah Kembali Bekas Galian Padat",
    satuanPekerjaan: "m3",
    kategoriGrup: "Tanah & Agregat",
    overheadPercent: 10,
    komponen: [
      { id: "k-tn2-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.250, hargaSatuan: 100000 },
      { id: "k-tn2-2", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.025, hargaSatuan: 150000 },
      { id: "k-tn2-3", kategori: "ALAT", uraian: "Stamper Kodok Tamping Rammer", satuan: "sewa-hari", koefisien: 0.010, hargaSatuan: 200000 }
    ]
  },
  {
    id: "ahsp-sirtu-1",
    kodeAhsp: "A.2.3.1.11",
    namaPekerjaan: "1 m3 Urugan Pasir Alas / Sirtu Padat Base Layer",
    satuanPekerjaan: "m3",
    kategoriGrup: "Tanah & Agregat",
    overheadPercent: 10,
    komponen: [
      { id: "k-sr1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.300, hargaSatuan: 100000 },
      { id: "k-sr1-2", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.030, hargaSatuan: 150000 },
      { id: "k-sr1-3", kategori: "BAHAN", uraian: "Sirtu Urug Padat", satuan: "m3", koefisien: 1.200, hargaSatuan: 190000 },
      { id: "k-sr1-4", kategori: "ALAT", uraian: "Stamper Tamping Rammer", satuan: "sewa-hari", koefisien: 0.010, hargaSatuan: 200000 }
    ]
  },
  {
    id: "ahsp-agregat-1",
    kodeAhsp: "A.2.3.1.14",
    namaPekerjaan: "1 m3 Pekerjaan Agregat Kelas B / Kelas A (Pematangan Jalan)",
    satuanPekerjaan: "m3",
    kategoriGrup: "Tanah & Agregat",
    overheadPercent: 10,
    komponen: [
      { id: "k-ag1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.350, hargaSatuan: 100000 },
      { id: "k-ag1-2", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.035, hargaSatuan: 150000 },
      { id: "k-ag1-3", kategori: "BAHAN", uraian: "Batu Agregat Kelas B / A", satuan: "m3", koefisien: 1.150, hargaSatuan: 260000 },
      { id: "k-ag1-4", kategori: "ALAT", uraian: "Vibratory Roller 8-10 Ton", satuan: "sewa-hari", koefisien: 0.010, hargaSatuan: 1400000 }
    ]
  },

  // -------------------------------------------------------------
  // 7. BANGUNAN & FINISHING
  // -------------------------------------------------------------
  {
    id: "ahsp-bata-1",
    kodeAhsp: "C.01.1",
    namaPekerjaan: "1 m2 Pasangan Dinding Bata Merah 1 SP : 4 PP",
    satuanPekerjaan: "m2",
    kategoriGrup: "Bangunan & Finishing",
    overheadPercent: 10,
    komponen: [
      { id: "k-bt1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.300, hargaSatuan: 100000 },
      { id: "k-bt1-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.100, hargaSatuan: 130000 },
      { id: "k-bt1-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.010, hargaSatuan: 145000 },
      { id: "k-bt1-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.015, hargaSatuan: 150000 },
      { id: "k-bt1-5", kategori: "BAHAN", uraian: "Bata Merah Standar", satuan: "buah", koefisien: 70.000, hargaSatuan: 1100 },
      { id: "k-bt1-6", kategori: "BAHAN", uraian: "Semen Portland (PC)", satuan: "kg", koefisien: 11.500, hargaSatuan: 1500 },
      { id: "k-bt1-7", kategori: "BAHAN", uraian: "Pasir Pasang", satuan: "m3", koefisien: 0.043, hargaSatuan: 240000 }
    ]
  },
  {
    id: "ahsp-hebel-1",
    kodeAhsp: "C.02.1",
    namaPekerjaan: "1 m2 Pasangan Dinding Batako / Hebel 10 cm + Mortar",
    satuanPekerjaan: "m2",
    kategoriGrup: "Bangunan & Finishing",
    overheadPercent: 10,
    komponen: [
      { id: "k-hb1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.200, hargaSatuan: 100000 },
      { id: "k-hb1-2", kategori: "UPAH", uraian: "Tukang Batu", satuan: "OH", koefisien: 0.100, hargaSatuan: 130000 },
      { id: "k-hb1-3", kategori: "UPAH", uraian: "Kepala Tukang", satuan: "OH", koefisien: 0.010, hargaSatuan: 145000 },
      { id: "k-hb1-4", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.010, hargaSatuan: 150000 },
      { id: "k-hb1-5", kategori: "BAHAN", uraian: "Hebel / Bata Ringan 10 cm", satuan: "buah", koefisien: 8.300, hargaSatuan: 10500 },
      { id: "k-hb1-6", kategori: "BAHAN", uraian: "Semen Mortar Perekat Hebel", satuan: "kg", koefisien: 4.000, hargaSatuan: 2500 }
    ]
  },
  {
    id: "ahsp-atap-1",
    kodeAhsp: "C.03.1",
    namaPekerjaan: "1 m2 Rangka Atap Baja Ringan C75 + Penutup Genteng Metal / Spandek",
    satuanPekerjaan: "m2",
    kategoriGrup: "Bangunan & Finishing",
    overheadPercent: 10,
    komponen: [
      { id: "k-at1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.200, hargaSatuan: 100000 },
      { id: "k-at1-2", kategori: "UPAH", uraian: "Tukang Baja Ringan", satuan: "OH", koefisien: 0.200, hargaSatuan: 135000 },
      { id: "k-at1-3", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.020, hargaSatuan: 150000 },
      { id: "k-at1-4", kategori: "BAHAN", uraian: "Canal C75 Baja Ringan t=0.75mm", satuan: "m'", koefisien: 1.200, hargaSatuan: 24000 },
      { id: "k-at1-5", kategori: "BAHAN", uraian: "Reng Baja Ringan t=0.45mm", satuan: "m'", koefisien: 2.400, hargaSatuan: 12000 },
      { id: "k-at1-6", kategori: "BAHAN", uraian: "Self Drilling Screw / Baut", satuan: "pcs", koefisien: 25.000, hargaSatuan: 500 },
      { id: "k-at1-7", kategori: "BAHAN", uraian: "Penutup Genteng Metal Pasir", satuan: "m2", koefisien: 1.100, hargaSatuan: 45000 }
    ]
  },
  {
    id: "ahsp-cat-1",
    kodeAhsp: "C.04.1",
    namaPekerjaan: "1 m2 Pengecatan Tembok Exterior / Interior 3 Lapis",
    satuanPekerjaan: "m2",
    kategoriGrup: "Bangunan & Finishing",
    overheadPercent: 10,
    komponen: [
      { id: "k-ct1-1", kategori: "UPAH", uraian: "Pekerja", satuan: "OH", koefisien: 0.160, hargaSatuan: 100000 },
      { id: "k-ct1-2", kategori: "UPAH", uraian: "Tukang Cat", satuan: "OH", koefisien: 0.060, hargaSatuan: 130000 },
      { id: "k-ct1-3", kategori: "UPAH", uraian: "Mandor", satuan: "OH", koefisien: 0.006, hargaSatuan: 150000 },
      { id: "k-ct1-4", kategori: "BAHAN", uraian: "Plamir Tembok", satuan: "kg", koefisien: 0.100, hargaSatuan: 18000 },
      { id: "k-ct1-5", kategori: "BAHAN", uraian: "Cat Dasar Tembok", satuan: "kg", koefisien: 0.100, hargaSatuan: 25000 },
      { id: "k-ct1-6", kategori: "BAHAN", uraian: "Cat Tembok Penutup (2 Lapis)", satuan: "kg", koefisien: 0.260, hargaSatuan: 42000 }
    ]
  }
];

export function CyberPlanAhspTab({ onBack }: CyberPlanAhspTabProps) {
  const [mounted, setMounted] = useState(false);
  const [ahspList, setAhspList] = useState<AhspPekerjaan[]>(defaultAhspList);
  const [selectedAhspId, setSelectedAhspId] = useState<string>("ahsp-tpt-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategoriGrup, setSelectedKategoriGrup] = useState<string>("SEMUA");

  // Modal State for Add/Edit AHSP Item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAhspId, setEditingAhspId] = useState<string | null>(null);

  const [kodeInput, setKodeInput] = useState("");
  const [namaInput, setNamaInput] = useState("");
  const [satuanInput, setSatuanInput] = useState("m3");
  const [kategoriGrupInput, setKategoriGrupInput] = useState<any>("TPT & DPT");
  const [overheadInput, setOverheadInput] = useState<number>(10);

  // New Komponen Form
  const [newKomponenKategori, setNewKomponenKategori] = useState<"UPAH" | "BAHAN" | "ALAT">("UPAH");
  const [newKomponenUraian, setNewKomponenUraian] = useState("");
  const [newKomponenSatuan, setNewKomponenSatuan] = useState("OH");
  const [newKomponenKoefisien, setNewKomponenKoefisien] = useState<number>(1);
  const [newKomponenHarga, setNewKomponenHarga] = useState<number>(100000);

  // Load / Save LocalStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("cyberplan_ahsp_list_v2");
      if (saved) {
        setAhspList(JSON.parse(saved));
      } else {
        // Migration check from v1
        const savedV1 = localStorage.getItem("cyberplan_ahsp_list_v1");
        if (!savedV1) {
          localStorage.setItem("cyberplan_ahsp_list_v2", JSON.stringify(defaultAhspList));
        }
      }
    } catch (err) {}
  }, []);

  const saveAhspToStorage = (newList: AhspPekerjaan[]) => {
    setAhspList(newList);
    try {
      localStorage.setItem("cyberplan_ahsp_list_v2", JSON.stringify(newList));
    } catch (err) {}
  };

  const handleResetToPuprPresets = () => {
    if (confirm("Apakah Anda yakin ingin mereset seluruh daftar AHSP ke preset standar Permen PUPR 2026 terbaru?")) {
      saveAhspToStorage(defaultAhspList);
      setSelectedAhspId(defaultAhspList[0].id);
    }
  };

  const activeAhsp = ahspList.find(a => a.id === selectedAhspId) || ahspList[0];

  // Calculations for Active AHSP
  const upahKomponen = activeAhsp ? activeAhsp.komponen.filter(k => k.kategori === "UPAH") : [];
  const bahanKomponen = activeAhsp ? activeAhsp.komponen.filter(k => k.kategori === "BAHAN") : [];
  const alatKomponen = activeAhsp ? activeAhsp.komponen.filter(k => k.kategori === "ALAT") : [];

  const totalUpah = upahKomponen.reduce((acc, curr) => acc + (curr.koefisien * curr.hargaSatuan), 0);
  const totalBahan = bahanKomponen.reduce((acc, curr) => acc + (curr.koefisien * curr.hargaSatuan), 0);
  const totalAlat = alatKomponen.reduce((acc, curr) => acc + (curr.koefisien * curr.hargaSatuan), 0);

  const jumlahDirect = totalUpah + totalBahan + totalAlat;
  const overheadAmount = (jumlahDirect * (activeAhsp?.overheadPercent || 10)) / 100;
  const hargaSatuanPekerjaanFinal = jumlahDirect + overheadAmount;

  // Add Komponen to Active AHSP
  const handleAddKomponen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKomponenUraian) {
      alert("Nama rincian komponen wajib diisi!");
      return;
    }

    const newK: AhspItemKomponen = {
      id: `komp-${Date.now()}`,
      kategori: newKomponenKategori,
      uraian: newKomponenUraian,
      satuan: newKomponenSatuan,
      koefisien: Number(newKomponenKoefisien) || 0,
      hargaSatuan: Number(newKomponenHarga) || 0
    };

    const updatedList = ahspList.map(item => {
      if (item.id === activeAhsp.id) {
        return {
          ...item,
          komponen: [...item.komponen, newK]
        };
      }
      return item;
    });

    saveAhspToStorage(updatedList);
    setNewKomponenUraian("");
  };

  const handleDeleteKomponen = (kompId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus rincian komponen ini?")) {
      const updatedList = ahspList.map(item => {
        if (item.id === activeAhsp.id) {
          return {
            ...item,
            komponen: item.komponen.filter(k => k.id !== kompId)
          };
        }
        return item;
      });
      saveAhspToStorage(updatedList);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAhspId(null);
    setKodeInput(`A.${ahspList.length + 1}.1.1`);
    setNamaInput("");
    setSatuanInput("m3");
    setKategoriGrupInput("TPT & DPT");
    setOverheadInput(10);
    setIsAddModalOpen(true);
  };

  const handleSaveAhspHeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaInput || !kodeInput) {
      alert("Kode dan Nama Analisis Pekerjaan wajib diisi!");
      return;
    }

    if (editingAhspId) {
      const updated = ahspList.map(item => item.id === editingAhspId ? {
        ...item,
        kodeAhsp: kodeInput,
        namaPekerjaan: namaInput,
        satuanPekerjaan: satuanInput,
        kategoriGrup: kategoriGrupInput,
        overheadPercent: Number(overheadInput) || 10
      } : item);
      saveAhspToStorage(updated);
    } else {
      const newItem: AhspPekerjaan = {
        id: `ahsp-custom-${Date.now()}`,
        kodeAhsp: kodeInput,
        namaPekerjaan: namaInput,
        satuanPekerjaan: satuanInput,
        kategoriGrup: kategoriGrupInput,
        overheadPercent: Number(overheadInput) || 10,
        komponen: []
      };
      saveAhspToStorage([...ahspList, newItem]);
      setSelectedAhspId(newItem.id);
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteAhspPekerjaan = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh Analisis AHSP ini?")) {
      const filtered = ahspList.filter(a => a.id !== id);
      saveAhspToStorage(filtered);
      if (filtered.length > 0) setSelectedAhspId(filtered[0].id);
    }
  };

  const handlePrintAhsp = () => {
    window.print();
  };

  // Group Categories for Filter Chips
  const categoriesList = [
    "SEMUA",
    "TPT & DPT",
    "Betonisasi Jalan",
    "Aspal & Hotmix",
    "Paving Block",
    "Drainase & U-Ditch",
    "Tanah & Agregat",
    "Bangunan & Finishing"
  ];

  const filteredAhspList = ahspList.filter(a => {
    const matchesQuery = !searchQuery || a.namaPekerjaan.toLowerCase().includes(searchQuery.toLowerCase()) || a.kodeAhsp.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedKategoriGrup === "SEMUA" || a.kategoriGrup === selectedKategoriGrup;
    return matchesQuery && matchesCategory;
  });

  const renderOfficialAhspDocument = () => (
    <div className="bg-white text-black font-serif text-[8.5pt] leading-relaxed p-6 box-border font-serif">
      {/* HEADER OFFICIAL DOKUMEN AHSP */}
      <div className="text-center font-bold uppercase space-y-1 border-b-2 border-black pb-4 mb-4">
        <h2 className="text-[11pt] font-black tracking-wide">ANALISIS HARGA SATUAN PEKERJAAN (AHSP)</h2>
        <h3 className="text-[10pt] font-bold">PEMERINTAH DESA CIMANGGU I KECAMATAN CIBUNGBULANG</h3>
        <p className="text-[8pt] font-normal normal-case italic">Standar Permen PUPR / AHSP Infrastruktur Pembangunan Desa 2026</p>
      </div>

      {/* METADATA ITEM PEKERJAAN */}
      <div className="mb-4 text-[9pt] font-bold space-y-1">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-3">Kode AHSP</div>
          <div className="col-span-9">: {activeAhsp?.kodeAhsp}</div>
        </div>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-3">Nama Pekerjaan</div>
          <div className="col-span-9">: {activeAhsp?.namaPekerjaan}</div>
        </div>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-3">Kategori Sektor</div>
          <div className="col-span-9">: {activeAhsp?.kategoriGrup || "Infrastruktur Desa"}</div>
        </div>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-3">Satuan Pekerjaan</div>
          <div className="col-span-9">: 1 {activeAhsp?.satuanPekerjaan}</div>
        </div>
      </div>

      {/* AHSP COMPONENT TABLE */}
      <table className="w-full border-collapse border border-black text-[8pt] font-serif">
        <thead>
          <tr className="bg-slate-100 text-center font-bold border-b border-black">
            <th className="border border-black p-1.5 w-10">No</th>
            <th className="border border-black p-1.5">Komponen Rincian Pekerjaan</th>
            <th className="border border-black p-1.5 w-16">Kode</th>
            <th className="border border-black p-1.5 w-16">Satuan</th>
            <th className="border border-black p-1.5 w-20">Koefisien</th>
            <th className="border border-black p-1.5 w-28 text-right">Harga Satuan (Rp)</th>
            <th className="border border-black p-1.5 w-32 text-right">Jumlah Harga (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {/* A. UPAH */}
          <tr className="font-bold bg-slate-50">
            <td className="border border-black p-1 text-center">A</td>
            <td className="border border-black p-1 uppercase" colSpan={5}>UPAH TENAGA KERJA</td>
            <td className="border border-black p-1 text-right font-mono font-bold">Rp {formatRupiah(totalUpah)}</td>
          </tr>
          {upahKomponen.map((k, idx) => (
            <tr key={k.id}>
              <td className="border border-black p-1 text-center">{idx + 1}</td>
              <td className="border border-black p-1 pl-4">{k.uraian}</td>
              <td className="border border-black p-1 text-center font-mono">L.0{idx + 1}</td>
              <td className="border border-black p-1 text-center">{k.satuan}</td>
              <td className="border border-black p-1 text-center font-mono">{k.koefisien.toFixed(3)}</td>
              <td className="border border-black p-1 text-right font-mono">Rp {formatRupiah(k.hargaSatuan)}</td>
              <td className="border border-black p-1 text-right font-mono font-semibold">Rp {formatRupiah(k.koefisien * k.hargaSatuan)}</td>
            </tr>
          ))}

          {/* B. BAHAN */}
          <tr className="font-bold bg-slate-50">
            <td className="border border-black p-1 text-center">B</td>
            <td className="border border-black p-1 uppercase" colSpan={5}>BAHAN / MATERIAL</td>
            <td className="border border-black p-1 text-right font-mono font-bold">Rp {formatRupiah(totalBahan)}</td>
          </tr>
          {bahanKomponen.map((k, idx) => (
            <tr key={k.id}>
              <td className="border border-black p-1 text-center">{idx + 1}</td>
              <td className="border border-black p-1 pl-4">{k.uraian}</td>
              <td className="border border-black p-1 text-center font-mono">M.0{idx + 1}</td>
              <td className="border border-black p-1 text-center">{k.satuan}</td>
              <td className="border border-black p-1 text-center font-mono">{k.koefisien.toFixed(3)}</td>
              <td className="border border-black p-1 text-right font-mono">Rp {formatRupiah(k.hargaSatuan)}</td>
              <td className="border border-black p-1 text-right font-mono font-semibold">Rp {formatRupiah(k.koefisien * k.hargaSatuan)}</td>
            </tr>
          ))}

          {/* C. ALAT */}
          <tr className="font-bold bg-slate-50">
            <td className="border border-black p-1 text-center">C</td>
            <td className="border border-black p-1 uppercase" colSpan={5}>PERALATAN</td>
            <td className="border border-black p-1 text-right font-mono font-bold">Rp {formatRupiah(totalAlat)}</td>
          </tr>
          {alatKomponen.map((k, idx) => (
            <tr key={k.id}>
              <td className="border border-black p-1 text-center">{idx + 1}</td>
              <td className="border border-black p-1 pl-4">{k.uraian}</td>
              <td className="border border-black p-1 text-center font-mono">E.0{idx + 1}</td>
              <td className="border border-black p-1 text-center">{k.satuan}</td>
              <td className="border border-black p-1 text-center font-mono">{k.koefisien.toFixed(3)}</td>
              <td className="border border-black p-1 text-right font-mono">Rp {formatRupiah(k.hargaSatuan)}</td>
              <td className="border border-black p-1 text-right font-mono font-semibold">Rp {formatRupiah(k.koefisien * k.hargaSatuan)}</td>
            </tr>
          ))}

          {/* SUMMARY REKAPITULASI */}
          <tr className="font-extrabold bg-slate-100 border-t-2 border-black">
            <td className="border border-black p-1 text-center">D</td>
            <td className="border border-black p-1" colSpan={5}>JUMLAH BIAYA UPAH, BAHAN DAN ALAT (A + B + C)</td>
            <td className="border border-black p-1 text-right font-mono font-black text-[9pt]">Rp {formatRupiah(jumlahDirect)}</td>
          </tr>
          <tr className="font-bold">
            <td className="border border-black p-1 text-center">E</td>
            <td className="border border-black p-1" colSpan={5}>Overhead & Keuntungan (Profit Margin {activeAhsp?.overheadPercent || 10}%)</td>
            <td className="border border-black p-1 text-right font-mono font-bold">Rp {formatRupiah(overheadAmount)}</td>
          </tr>
          <tr className="font-black text-[9.5pt] bg-amber-100 border-t-2 border-b-2 border-black">
            <td className="border border-black p-1 text-center">F</td>
            <td className="border border-black p-1 uppercase" colSpan={5}>HARGA SATUAN PEKERJAAN (D + E) PER 1 {activeAhsp?.satuanPekerjaan?.toUpperCase()}</td>
            <td className="border border-black p-1 text-right font-mono font-black text-[10pt] text-slate-900">Rp {formatRupiah(hargaSatuanPekerjaanFinal)}</td>
          </tr>
        </tbody>
      </table>

      {/* SIGNATURE */}
      <div className="mt-8 flex justify-end text-center font-bold text-[9pt]">
        <div className="w-64 space-y-1">
          <div>Bogor, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
          <div>TIM PENYUSUN / KAUR PERENCANAAN</div>
          <div className="h-16"></div>
          <div className="underline uppercase font-extrabold">MUHAMAD ALDIANSYAH</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 min-h-[calc(100vh-80px)] font-sans relative pb-28 md:pb-8">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER TOOLBAR                                         */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
              title="Kembali ke Perencanaan"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              AHSP (Analisis Harga Satuan Pekerjaan)
              <Sparkles size={16} className="text-amber-500" />
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Standar Permen PUPR / AHSP Bina Marga & Cipta Karya 2026 (TPT, DPT, Cor Jalan, Hotmix, Paving & U-Ditch)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handleResetToPuprPresets}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Muat Ulang Seluruh Preset Standar PUPR 2026"
          >
            <RefreshCw size={14} /> <span>Reset Preset PUPR 2026</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> <span>Tambah Pekerjaan AHSP</span>
          </button>

          <button
            onClick={handlePrintAhsp}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <Printer size={16} /> <span>Cetak AHSP (F4 Portrait)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN LAYOUT: PRESET SIDEBAR VS CALCULATOR ENGINE            */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PRESET SELECTOR (COL SPAN 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Pekerjaan (Contoh: TPT, Hotmix, Cor K-225)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-slate-50"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedKategoriGrup(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedKategoriGrup === cat
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
            <span>Preset Pekerjaan ({filteredAhspList.length})</span>
            <span className="text-[10px] text-emerald-600">PUPR 2026</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredAhspList.map(a => {
              const isSelected = a.id === selectedAhspId;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAhspId(a.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-black ${isSelected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                        {a.kodeAhsp}
                      </span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${isSelected ? "bg-emerald-600/60 text-emerald-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                        {a.kategoriGrup || "Infrastruktur"}
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-snug">{a.namaPekerjaan}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAhspPekerjaan(a.id);
                      }}
                      className={`p-1 rounded hover:bg-rose-600 hover:text-white transition-all ${isSelected ? "text-emerald-100" : "text-rose-400"}`}
                      title="Hapus AHSP Pekerjaan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredAhspList.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <FolderOpen size={28} className="mx-auto text-slate-300" />
                <p>Tidak ada analisis AHSP yang cocok dengan pencarian / filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE AHSP CALCULATOR & DETAILS (COL SPAN 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active AHSP Summary Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black border border-emerald-500/30">
                  Kode AHSP: {activeAhsp?.kodeAhsp}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold text-[10px] border border-slate-700">
                  {activeAhsp?.kategoriGrup || "Infrastruktur Desa"}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Overhead & Profit: <span className="text-white font-mono font-black">{activeAhsp?.overheadPercent || 10}%</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black">{activeAhsp?.namaPekerjaan}</h2>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Harga Satuan Pekerjaan Final</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  Rp {formatRupiah(hargaSatuanPekerjaanFinal)} <span className="text-xs font-sans text-slate-400 font-bold">/ {activeAhsp?.satuanPekerjaan}</span>
                </p>
              </div>

              <div className="text-right text-xs font-mono text-slate-300">
                <div>Upah: Rp {formatRupiah(totalUpah)}</div>
                <div>Bahan: Rp {formatRupiah(totalBahan)}</div>
                <div>Alat: Rp {formatRupiah(totalAlat)}</div>
              </div>
            </div>
          </div>

          {/* Komponen Breakdown Tables & Add Komponen Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            
            {/* Add Komponen Form */}
            <form onSubmit={handleAddKomponen} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Plus size={16} className="text-emerald-600" /> Tambah Rincian Komponen (Upah / Bahan / Alat)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={newKomponenKategori}
                    onChange={(e) => setNewKomponenKategori(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="UPAH">UPAH TENAGA</option>
                    <option value="BAHAN">BAHAN / MATERIAL</option>
                    <option value="ALAT">PERALATAN</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Uraian Komponen</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pekerja / Semen PC / Pasir"
                    value={newKomponenUraian}
                    onChange={(e) => setNewKomponenUraian(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Koefisien</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newKomponenKoefisien}
                    onChange={(e) => setNewKomponenKoefisien(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    value={newKomponenHarga}
                    onChange={(e) => setNewKomponenHarga(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={14} /> <span>Tambah Komponen</span>
                </button>
              </div>
            </form>

            {/* Rincian Komponen Active AHSP Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10">No</th>
                    <th className="py-2.5 px-3">Komponen Rincian</th>
                    <th className="py-2.5 px-3 text-center w-20">Satuan</th>
                    <th className="py-2.5 px-3 text-center w-24">Koefisien</th>
                    <th className="py-2.5 px-3 text-right w-32">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right w-36">Jumlah Harga</th>
                    <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* UPAH */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-3 text-center">A</td>
                    <td className="py-2 px-3 uppercase" colSpan={4}>TENAGA KERJA / UPAH</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">Rp {formatRupiah(totalUpah)}</td>
                    <td className="py-2 px-3"></td>
                  </tr>
                  {upahKomponen.map((k, idx) => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{k.uraian}</td>
                      <td className="py-2 px-3 text-center">{k.satuan}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{k.koefisien.toFixed(3)}</td>
                      <td className="py-2 px-3 text-right font-mono">Rp {formatRupiah(k.hargaSatuan)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">Rp {formatRupiah(k.koefisien * k.hargaSatuan)}</td>
                      <td className="py-2 px-3 text-center">
                        <button onClick={() => handleDeleteKomponen(k.id)} className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* BAHAN */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-3 text-center">B</td>
                    <td className="py-2 px-3 uppercase" colSpan={4}>BAHAN / MATERIAL</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">Rp {formatRupiah(totalBahan)}</td>
                    <td className="py-2 px-3"></td>
                  </tr>
                  {bahanKomponen.map((k, idx) => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{k.uraian}</td>
                      <td className="py-2 px-3 text-center">{k.satuan}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{k.koefisien.toFixed(3)}</td>
                      <td className="py-2 px-3 text-right font-mono">Rp {formatRupiah(k.hargaSatuan)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">Rp {formatRupiah(k.koefisien * k.hargaSatuan)}</td>
                      <td className="py-2 px-3 text-center">
                        <button onClick={() => handleDeleteKomponen(k.id)} className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* ALAT */}
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2 px-3 text-center">C</td>
                    <td className="py-2 px-3 uppercase" colSpan={4}>PERALATAN</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">Rp {formatRupiah(totalAlat)}</td>
                    <td className="py-2 px-3"></td>
                  </tr>
                  {alatKomponen.map((k, idx) => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{k.uraian}</td>
                      <td className="py-2 px-3 text-center">{k.satuan}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{k.koefisien.toFixed(3)}</td>
                      <td className="py-2 px-3 text-right font-mono">Rp {formatRupiah(k.hargaSatuan)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">Rp {formatRupiah(k.koefisien * k.hargaSatuan)}</td>
                      <td className="py-2 px-3 text-center">
                        <button onClick={() => handleDeleteKomponen(k.id)} className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* SUMMARY */}
                  <tr className="font-extrabold border-t-2 border-slate-900 bg-slate-100 text-slate-900">
                    <td className="py-2.5 px-3 text-center">D</td>
                    <td className="py-2.5 px-3" colSpan={4}>JUMLAH BIAYA DIRECT (A + B + C)</td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-sm">Rp {formatRupiah(jumlahDirect)}</td>
                    <td className="py-2.5 px-3"></td>
                  </tr>
                  <tr className="font-bold text-slate-700">
                    <td className="py-2.5 px-3 text-center">E</td>
                    <td className="py-2.5 px-3" colSpan={4}>Overhead & Keuntungan ({activeAhsp?.overheadPercent || 10}%)</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">Rp {formatRupiah(overheadAmount)}</td>
                    <td className="py-2.5 px-3"></td>
                  </tr>
                  <tr className="font-black bg-emerald-100 text-emerald-950 border-t-2 border-b-2 border-emerald-300">
                    <td className="py-3 px-3 text-center">F</td>
                    <td className="py-3 px-3 uppercase text-xs" colSpan={4}>HARGA SATUAN PEKERJAAN FINAL (D + E)</td>
                    <td className="py-3 px-3 text-right font-mono font-black text-base text-emerald-900">Rp {formatRupiah(hargaSatuanPekerjaanFinal)}</td>
                    <td className="py-3 px-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SAFE PRINT PORTAL FOR DOKUMEN AHSP PRINTING               */}
      {/* ------------------------------------------------------------- */}
      <SafePrintPortal portalId="ahsp-print-mount-root">
        <style dangerouslySetInnerHTML={{
          __html: `
          @media screen {
            #ahsp-print-mount-root {
              display: none !important;
            }
          }
          @media print {
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              overflow: visible !important;
            }

            body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
              display: none !important;
            }

            #ahsp-print-mount-root {
              display: block !important;
              visibility: visible !important;
            }

            #ahsp-print-document {
              display: block !important;
              width: 215.9mm !important;
              max-width: 100% !important;
              margin: 0 auto !important;
            }

            #ahsp-print-mount-root * {
              visibility: visible !important;
            }

            @page {
              size: 215.9mm 330.2mm portrait;
              margin: 10mm;
            }
          }
          `
        }} />
        <div id="ahsp-print-document">
          {renderOfficialAhspDocument()}
        </div>
      </SafePrintPortal>

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL TAMBAH PEKERJAAN AHSP                                */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Calculator size={16} className="text-emerald-600" />
                {editingAhspId ? "Edit Header AHSP Pekerjaan" : "Tambah Analisis AHSP Pekerjaan"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAhspHeader} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode AHSP</label>
                <input
                  type="text"
                  value={kodeInput}
                  onChange={(e) => setKodeInput(e.target.value)}
                  placeholder="Contoh: A.3.2.1.1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Uraian Pekerjaan</label>
                <input
                  type="text"
                  value={namaInput}
                  onChange={(e) => setNamaInput(e.target.value)}
                  placeholder="Contoh: 1 m3 Pasangan Batu Kali (1:4)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategori Sektor Pekerjaan</label>
                <select
                  value={kategoriGrupInput}
                  onChange={(e) => setKategoriGrupInput(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="TPT & DPT">TPT & DPT</option>
                  <option value="Betonisasi Jalan">Betonisasi Jalan</option>
                  <option value="Aspal & Hotmix">Aspal & Hotmix</option>
                  <option value="Paving Block">Paving Block</option>
                  <option value="Drainase & U-Ditch">Drainase & U-Ditch</option>
                  <option value="Tanah & Agregat">Tanah & Agregat</option>
                  <option value="Bangunan & Finishing">Bangunan & Finishing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan Pekerjaan</label>
                  <input
                    type="text"
                    value={satuanInput}
                    onChange={(e) => setSatuanInput(e.target.value)}
                    placeholder="Contoh: m3 / m2 / m' / Ton / kg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Overhead & Profit (%)</label>
                  <input
                    type="number"
                    value={overheadInput}
                    onChange={(e) => setOverheadInput(Number(e.target.value))}
                    placeholder="Contoh: 10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Simpan Pekerjaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
