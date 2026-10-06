"use client";

import React, { useState, useEffect } from "react";
import { 
  Printer, 
  Edit3, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Banknote, 
  Coins, 
  TrendingUp, 
  Calculator, 
  Plus,
  Trash2,
  X,
  Search,
  FileSpreadsheet,
  Eye,
  Table,
  Settings,
  RefreshCw
} from "lucide-react";
import { 
  getSavedKodeRekeningList, 
  KodeRekeningItem,
  getSavedKodeKegiatanList,
  KodeKegiatanItem,
  getSavedSumberDanaList,
  SumberDanaItem
} from "@/lib/kodeRekeningData";
import { getRkkdPagus } from "@/lib/rkkdStore";
import { SafePrintPortal } from "./SafePrintPortal";

export interface PendapatanApbdes {
  id: string;
  kode: string;
  nama: string;
  sumberDana: string;
  paguAnggaran: number;
}

export interface BelanjaApbdesItem {
  id: string;
  bidangCode: "1" | "2" | "3" | "4" | "5";
  bidangName: string;
  subBidangCode: string; // e.g. "1.1"
  subBidangName: string;
  kodeRekeningKegiatan: string; // e.g. "1.1.1"
  jenisBelanjaKode: "5.1." | "5.2." | "5.3." | "5.4.";
  jenisBelanjaName: string;
  kodeRekeningRincian: string; // e.g. "5.1.1.01."
  uraianSubKegiatan: string;
  uraian: string;
  anggaran: number;
  sumberDana: string;
}

export interface PembiayaanApbdesItem {
  id: string;
  type: "PENERIMAAN" | "PENGELUARAN";
  kode: string;
  nama: string;
  anggaran: number;
}

interface ApbdesTotalTabProps {
  rkkdActivities?: any[];
  onNavigateToRkkd?: (subTab: string) => void;
}

// Map Obyek Code to Official Title
const obyekNameMap: Record<string, string> = {
  "5.1.1.": "Penghasilan Tetap dan Tunjangan Kepala Desa",
  "5.1.2.": "Penghasilan Tetap dan Tunjangan Perangkat Desa",
  "5.1.3.": "Jaminan Sosial Kepala Desa dan Perangkat Desa",
  "5.1.4.": "Tunjangan BPD",
  "5.2.1.": "Belanja Barang Perlengkapan",
  "5.2.2.": "Belanja Jasa Honorarium",
  "5.2.5.": "Belanja Operasional Perkantoran",
  "5.2.6.": "Belanja Pemeliharaan",
  "5.2.7.": "Belanja Barang dan Jasa yang Diserahkan kepada Masyarakat",
  "5.3.4.": "Belanja Modal Gedung, Bangunan dan Taman",
  "5.3.5.": "Belanja Modal Jalan/Prasarana Jalan",
  "5.4.1.": "Belanja Tidak Terduga"
};

function getObyekCode(rincianCode: string): string {
  if (!rincianCode) return "";
  const parts = rincianCode.split(".").filter(Boolean);
  if (parts.length >= 3) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.`;
  }
  return rincianCode;
}

function formatAnggaranVal(val: number): string {
  if (!val || val === 0) return "-";
  return val.toLocaleString("id-ID");
}

// Initial Default Data (Anggaran disesuaikan dengan nilai riil dari inputan sebelumnya)
const defaultPendapatanList: PendapatanApbdes[] = [
  { id: "pen-1", kode: "4.1.1.01.", nama: "Hasil Usaha Desa", sumberDana: "PAD", paguAnggaran: 1000000 },
  { id: "pen-2", kode: "4.2.1.01.", nama: "Dana Desa", sumberDana: "DDS", paguAnggaran: 1530900000 },
  { id: "pen-3", kode: "4.2.2.01.", nama: "Bagi Hasil Pajak dan Retribusi", sumberDana: "PBH", paguAnggaran: 435351216 },
  { id: "pen-4", kode: "4.2.3.01.", nama: "Alokasi Dana Desa", sumberDana: "ADD", paguAnggaran: 916400000 },
  { id: "pen-5", kode: "4.2.4.01.", nama: "Bantuan Keuangan Provinsi", sumberDana: "PBP", paguAnggaran: 130000000 },
  { id: "pen-6", kode: "4.2.5.01.", nama: "Bantuan Keuangan Kabupaten", sumberDana: "PBK", paguAnggaran: 1500000000 },
  { id: "pen-7", kode: "4.3.5.01.", nama: "Koreksi Kesalahan Belanja Tahun-tahun Sebelumnya", sumberDana: "DLL", paguAnggaran: 280533811 },
  { id: "pen-8", kode: "4.3.6.01.", nama: "Bunga Bank", sumberDana: "DLL", paguAnggaran: 288439 }
];

const defaultBelanjaList: BelanjaApbdesItem[] = [
  // --- 1.1.1 ---
  { id: "bel-1", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.1", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.1.01.", uraianSubKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa", uraian: "Penghasilan Tetap Kepala Desa", anggaran: 28190292, sumberDana: "ADD, PBH" },
  { id: "bel-2", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.1", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.1.02.", uraianSubKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa", uraian: "Tunjangan Kepala Desa", anggaran: 6000000, sumberDana: "ADD, PBH" },
  { id: "bel-3", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.1", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.1.99.", uraianSubKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa", uraian: "Penerimaan Lain-lain Kepala Desa yang Sah", anggaran: 7500000, sumberDana: "ADD, PBH" },

  // --- 1.1.2 ---
  { id: "bel-4", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.2", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.2.01.", uraianSubKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Perangkat Desa", uraian: "Penghasilan Tetap Perangkat Desa", anggaran: 172993212, sumberDana: "ADD, PBH" },
  { id: "bel-5", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.2", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.2.02.", uraianSubKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Perangkat Desa", uraian: "Tunjangan Perangkat Desa", anggaran: 18400000, sumberDana: "ADD, PBH" },
  { id: "bel-6", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.2", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.2.99.", uraianSubKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Perangkat Desa", uraian: "Penerimaan Lain-lain Perangkat Desa yang Sah", anggaran: 26000000, sumberDana: "ADD, PBH" },

  // --- 1.1.3 ---
  { id: "bel-7", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.3", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.3.04.", uraianSubKegiatan: "Penyediaan Jaminan Sosial bagi Kepala Desa dan Perangkat Desa", uraian: "Jaminan Ketenagakerjaan Perangkat Desa", anggaran: 6389760, sumberDana: "ADD, PBH" },

  // --- 1.1.4 ---
  { id: "bel-8", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.4", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.01.", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)", uraian: "Belanja Alat Tulis Kantor dan Benda Pos", anggaran: 7966000, sumberDana: "ADD, DLL, PAD, PBH, PBK" },
  { id: "bel-9", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.4", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.02.", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)", uraian: "Belanja Jasa Honorarium Pembantu Tugas Umum Desa/Operator", anggaran: 12250000, sumberDana: "ADD, DLL, PAD, PBH, PBK" },
  { id: "bel-10", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.4", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.05.", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)", uraian: "Belanja Jasa Honorarium Petugas", anggaran: 21000000, sumberDana: "ADD, DLL, PAD, PBH, PBK" },
  { id: "bel-11", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.4", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.5.01.", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)", uraian: "Belanja Jasa Langganan Listrik", anggaran: 812000, sumberDana: "ADD, DLL, PAD, PBH, PBK" },
  { id: "bel-12", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.4", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.5.05.", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)", uraian: "Belanja Jasa Langganan Internet", anggaran: 1740000, sumberDana: "ADD, DLL, PAD, PBH, PBK" },
  { id: "bel-13", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.4", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.5.07.", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)", uraian: "Belanja Jasa Perpanjangan Ijin/Pajak", anggaran: 57688, sumberDana: "ADD, DLL, PAD, PBH, PBK" },

  // --- 1.1.5 ---
  { id: "bel-14", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.5", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.4.01.", uraianSubKegiatan: "Penyediaan Tunjangan BPD", uraian: "Tunjangan Kedudukan BPD", anggaran: 46200000, sumberDana: "ADD" },

  // --- 1.1.6 ---
  { id: "bel-15", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.6", jenisBelanjaKode: "5.1.", jenisBelanjaName: "Belanja Pegawai", kodeRekeningRincian: "5.1.3.04.", uraianSubKegiatan: "Penyediaan Operasional BPD (rapat, ATK, Makan Minum, Pakaian Seragam, Listrik dll)", uraian: "Jaminan Ketenagakerjaan Perangkat Desa", anggaran: 4492800, sumberDana: "ADD, PBH, PBP" },
  { id: "bel-16", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.6", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.01.", uraianSubKegiatan: "Penyediaan Operasional BPD (rapat, ATK, Makan Minum, Pakaian Seragam, Listrik dll)", uraian: "Belanja Alat Tulis Kantor dan Benda Pos", anggaran: 750000, sumberDana: "ADD, PBH, PBP" },
  { id: "bel-17", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.6", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.90.", uraianSubKegiatan: "Penyediaan Operasional BPD (rapat, ATK, Makan Minum, Pakaian Seragam, Listrik dll)", uraian: "Belanja Jasa Honorarium BPD", anggaran: 4500000, sumberDana: "ADD, PBH, PBP" },

  // --- 1.1.7 ---
  { id: "bel-18", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.7", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.5.08.", uraianSubKegiatan: "Penyediaan Insentif/Operasional RT/RW", uraian: "Belanja Insentif/Operasional RT/RW", anggaran: 147600000, sumberDana: "ADD" },

  // --- 1.1.8 ---
  { id: "bel-19", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.1", subBidangName: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "1.1.8", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.7.01.", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa yang bersumber dari Dana Desa", uraian: "Belanja Bahan Perlengkapan untuk Diserahkan kepada Masyarakat", anggaran: 6300000, sumberDana: "DDS" },

  // --- 1.2.2 ---
  { id: "bel-20", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.2", subBidangName: "Penyediaan Sarana Prasarana Pemerintahan Desa", kodeRekeningKegiatan: "1.2.2", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.6.02.", uraianSubKegiatan: "Pemeliharaan Gedung/Prasarana Kantor Desa", uraian: "Belanja Pemeliharaan Kendaraan Bermotor", anggaran: 5000000, sumberDana: "PBH" },

  // --- 1.3.5 ---
  { id: "bel-21", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.3", subBidangName: "Pengelolaan Administrasi Kependudukan, Pencatatan Sipil, Statistik dan Kearsipan", kodeRekeningKegiatan: "1.3.5", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.05.", uraianSubKegiatan: "Pemetaan dan Analisis Kemiskinan Desa secara Partisipatif", uraian: "Belanja Jasa Honorarium Petugas", anggaran: 6000000, sumberDana: "PBH" },

  // --- 1.4.1 ---
  { id: "bel-22", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.4", subBidangName: "Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "1.4.1", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.06.", uraianSubKegiatan: "Penyelenggaraan Musyawarah Perencanaan Desa/Pembahasan APBDes (Reguler)", uraian: "Belanja Barang Konsumsi (Makan/Minum)", anggaran: 2950000, sumberDana: "PBH" },
  { id: "bel-23", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.4", subBidangName: "Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "1.4.1", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.08.", uraianSubKegiatan: "Penyelenggaraan Musyawarah Perencanaan Desa/Pembahasan APBDes (Reguler)", uraian: "Belanja Bendera/Umbul-umbul/Spanduk", anggaran: 50000, sumberDana: "PBH" },

  // --- 1.4.7 ---
  { id: "bel-24", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.4", subBidangName: "Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "1.4.7", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.01.", uraianSubKegiatan: "Penyusunan Laporan Kepala Desa, LPPDesa dan Informasi Kepada Masyarakat", uraian: "Belanja Alat Tulis Kantor dan Benda Pos", anggaran: 125000, sumberDana: "PBH" },
  { id: "bel-25", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.4", subBidangName: "Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "1.4.7", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.06.", uraianSubKegiatan: "Penyusunan Laporan Kepala Desa, LPPDesa dan Informasi Kepada Masyarakat", uraian: "Belanja Barang Konsumsi (Makan/Minum)", anggaran: 5725000, sumberDana: "PBH" },
  { id: "bel-26", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.4", subBidangName: "Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "1.4.7", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.08.", uraianSubKegiatan: "Penyusunan Laporan Kepala Desa, LPPDesa dan Informasi Kepada Masyarakat", uraian: "Belanja Bendera/Umbul-umbul/Spanduk", anggaran: 150000, sumberDana: "PBH" },

  // --- 1.5.6 ---
  { id: "bel-27", bidangCode: "1", bidangName: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", subBidangCode: "1.5", subBidangName: "Sub Bidang Pertanahan", kodeRekeningKegiatan: "1.5.6", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.5.07.", uraianSubKegiatan: "Adminstrasi Pajak Bumi dan Bangunan (PBB)", uraian: "Belanja Jasa Perpanjangan Ijin/Pajak", anggaran: 199000, sumberDana: "PBH" },

  // --- BIDANG 2 PEMBANGUNAN ---
  { id: "bel-28", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.2", subBidangName: "Sub Bidang Kesehatan", kodeRekeningKegiatan: "2.2.2", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.01.", uraianSubKegiatan: "Penyelenggaraan Posyandu (Mkn Tambahan, Kls Bumil, Lansia, Insentif)", uraian: "Belanja Alat Tulis Kantor dan Benda Pos", anggaran: 600000, sumberDana: "ADD, DDS, PBH" },
  { id: "bel-29", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.2", subBidangName: "Sub Bidang Kesehatan", kodeRekeningKegiatan: "2.2.2", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.05.", uraianSubKegiatan: "Penyelenggaraan Posyandu (Mkn Tambahan, Kls Bumil, Lansia, Insentif)", uraian: "Belanja Barang Cetak dan Penggandaan", anggaran: 150000, sumberDana: "ADD, DDS, PBH" },
  { id: "bel-30", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.2", subBidangName: "Sub Bidang Kesehatan", kodeRekeningKegiatan: "2.2.2", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.03.", uraianSubKegiatan: "Penyelenggaraan Posyandu (Mkn Tambahan, Kls Bumil, Lansia, Insentif)", uraian: "Belanja Jasa Honorarium/Insentif Pelayanan Desa", anggaran: 46800000, sumberDana: "ADD, DDS, PBH" },
  { id: "bel-31", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.2", subBidangName: "Sub Bidang Kesehatan", kodeRekeningKegiatan: "2.2.2", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.5.99.", uraianSubKegiatan: "Penyelenggaraan Posyandu (Mkn Tambahan, Kls Bumil, Lansia, Insentif)", uraian: "Belanja Operasional Perkantoran lainnya", anggaran: 10500000, sumberDana: "ADD, DDS, PBH" },

  { id: "bel-32", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.2", subBidangName: "Sub Bidang Kesehatan", kodeRekeningKegiatan: "2.2.9", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.4.01.", uraianSubKegiatan: "Pembangunan/Rehabilitasi/Peningkatan/Pengadaan Sarana/Prasarana Posyandu/Polindes", uraian: "Belanja Modal Gedung, Bangunan, Taman - Honor Pelaksana Kegiatan", anggaran: 4550000, sumberDana: "DDS, PBH" },
  { id: "bel-33", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.2", subBidangName: "Sub Bidang Kesehatan", kodeRekeningKegiatan: "2.2.9", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.4.02.", uraianSubKegiatan: "Pembangunan/Rehabilitasi/Peningkatan/Pengadaan Sarana/Prasarana Posyandu/Polindes", uraian: "Belanja Modal Gedung, Bangunan, Taman - Upah Tenaga Kerja", anggaran: 16080000, sumberDana: "DDS, PBH" },
  { id: "bel-34", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.2", subBidangName: "Sub Bidang Kesehatan", kodeRekeningKegiatan: "2.2.9", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.4.03.", uraianSubKegiatan: "Pembangunan/Rehabilitasi/Peningkatan/Pengadaan Sarana/Prasarana Posyandu/Polindes", uraian: "Belanja Modal Gedung, Bangunan, Taman - Bahan Baku/Material", anggaran: 43123000, sumberDana: "DDS, PBH" },
  { id: "bel-35", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.2", subBidangName: "Sub Bidang Kesehatan", kodeRekeningKegiatan: "2.2.9", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.4.05.", uraianSubKegiatan: "Pembangunan/Rehabilitasi/Peningkatan/Pengadaan Sarana/Prasarana Posyandu/Polindes", uraian: "Belanja Modal Gedung, Bangunan, Taman - Administrasi Kegiatan", anggaran: 300000, sumberDana: "DDS, PBH" },

  { id: "bel-36", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.3", subBidangName: "Sub Bidang Pekerjaan Umum dan Penataan Ruang", kodeRekeningKegiatan: "2.3.5", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.5.02.", uraianSubKegiatan: "Pemeliharaan Prasarana Jalan Desa (Gorong-gorong/Selokan/Parit/Drainase dll)", uraian: "Belanja Modal Jalan - Upah Tenaga Kerja", anggaran: 5000000, sumberDana: "DDS, DLL" },

  { id: "bel-37", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.4", subBidangName: "Sub Bidang Kawasan Pemukiman", kodeRekeningKegiatan: "2.4.14", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.4.01.", uraianSubKegiatan: "Pembangunan/Rehabilitas/Peningkatan Fasilitas Jamban Umum/MCK umum, dll", uraian: "Belanja Modal Gedung, Bangunan, Taman - Honor Pelaksana Kegiatan", anggaran: 5200000, sumberDana: "DDS" },
  { id: "bel-38", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.4", subBidangName: "Sub Bidang Kawasan Pemukiman", kodeRekeningKegiatan: "2.4.14", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.4.02.", uraianSubKegiatan: "Pembangunan/Rehabilitas/Peningkatan Fasilitas Jamban Umum/MCK umum, dll", uraian: "Belanja Modal Gedung, Bangunan, Taman - Upah Tenaga Kerja", anggaran: 12900000, sumberDana: "DDS" },
  { id: "bel-39", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.4", subBidangName: "Sub Bidang Kawasan Pemukiman", kodeRekeningKegiatan: "2.4.14", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.4.03.", uraianSubKegiatan: "Pembangunan/Rehabilitas/Peningkatan Fasilitas Jamban Umum/MCK umum, dll", uraian: "Belanja Modal Gedung, Bangunan, Taman - Bahan Baku/Material", anggaran: 34619000, sumberDana: "DDS" },
  { id: "bel-40", bidangCode: "2", bidangName: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", subBidangCode: "2.4", subBidangName: "Sub Bidang Kawasan Pemukiman", kodeRekeningKegiatan: "2.4.14", jenisBelanjaKode: "5.3.", jenisBelanjaName: "Belanja Modal", kodeRekeningRincian: "5.3.4.05.", uraianSubKegiatan: "Pembangunan/Rehabilitas/Peningkatan Fasilitas Jamban Umum/MCK umum, dll", uraian: "Belanja Modal Gedung, Bangunan, Taman - Administrasi Kegiatan", anggaran: 500000, sumberDana: "DDS" },

  // --- BIDANG 3 PEMBINAAN ---
  { id: "bel-41", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.1", subBidangName: "Sub Bidang Ketenteraman, Ketertiban Umum dan Perlindungan Masyarakat", kodeRekeningKegiatan: "3.1.90", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.05.", uraianSubKegiatan: "Penyediaan Insentif/Operasional Linmas", uraian: "Belanja Jasa Honorarium Petugas", anggaran: 18000000, sumberDana: "ADD" },
  { id: "bel-42", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.2", subBidangName: "Sub Bidang Kebudayaan dan Keagamaan", kodeRekeningKegiatan: "3.2.3", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.06.", uraianSubKegiatan: "Penyelenggaran Festival Kesenian, Adat/Kebudayaan, dan Kegamaan", uraian: "Belanja Barang Konsumsi (Makan/Minum)", anggaran: 19575000, sumberDana: "PBH" },
  { id: "bel-43", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.2", subBidangName: "Sub Bidang Kebudayaan dan Keagamaan", kodeRekeningKegiatan: "3.2.3", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.1.08.", uraianSubKegiatan: "Penyelenggaran Festival Kesenian, Adat/Kebudayaan, dan Kegamaan", uraian: "Belanja Bendera/Umbul-umbul/Spanduk", anggaran: 150000, sumberDana: "PBH" },
  { id: "bel-44", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.2", subBidangName: "Sub Bidang Kebudayaan dan Keagamaan", kodeRekeningKegiatan: "3.2.90", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.04.", uraianSubKegiatan: "Penyuluhan dan Pendampingan Keagamaan", uraian: "Belanja Jasa Honorarium Tenaga Ahli/Profesi/Konsultan/Narasumber", anggaran: 30000000, sumberDana: "ADD" },
  { id: "bel-45", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.3", subBidangName: "Sub Bidang Kepemudaan dan Olahraga", kodeRekeningKegiatan: "3.3.6", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.05.", uraianSubKegiatan: "Pembinaan Karangtaruna/Klub Kepemudaan/Olahraga Tingkat Desa", uraian: "Belanja Jasa Honorarium Petugas", anggaran: 750000, sumberDana: "PBH" },
  { id: "bel-46", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.4", subBidangName: "Sub Bidang Kelembagaan Masyarakat", kodeRekeningKegiatan: "3.4.2", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.03.", uraianSubKegiatan: "Pembinaan LKMD/LPM/LPMD", uraian: "Belanja Jasa Honorarium/Insentif Pelayanan Desa", anggaran: 7050000, sumberDana: "PBH" },
  { id: "bel-47", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.4", subBidangName: "Sub Bidang Kelembagaan Masyarakat", kodeRekeningKegiatan: "3.4.2", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.5.99.", uraianSubKegiatan: "Pembinaan LKMD/LPM/LPMD", uraian: "Belanja Operasional Perkantoran lainnya", anggaran: 600000, sumberDana: "PBH" },
  { id: "bel-48", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.4", subBidangName: "Sub Bidang Kelembagaan Masyarakat", kodeRekeningKegiatan: "3.4.3", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.2.03.", uraianSubKegiatan: "Pembinaan PKK", uraian: "Belanja Jasa Honorarium/Insentif Pelayanan Desa", anggaran: 8160000, sumberDana: "PBH" },
  { id: "bel-49", bidangCode: "3", bidangName: "BIDANG PEMBINAAN KEMASYARAKATAN", subBidangCode: "3.4", subBidangName: "Sub Bidang Kelembagaan Masyarakat", kodeRekeningKegiatan: "3.4.3", jenisBelanjaKode: "5.2.", jenisBelanjaName: "Belanja Barang dan Jasa", kodeRekeningRincian: "5.2.5.99.", uraianSubKegiatan: "Pembinaan PKK", uraian: "Belanja Operasional Perkantoran lainnya", anggaran: 3600000, sumberDana: "PBH" },

  // --- BIDANG 5 BENCANA ---
  { id: "bel-50", bidangCode: "5", bidangName: "BIDANG PENANGGULANGAN BENCANA, DARURAT DAN MENDESAK DESA", subBidangCode: "5.3", subBidangName: "Sub Bidang Keadaan Mendesak", kodeRekeningKegiatan: "5.3.0", jenisBelanjaKode: "5.4.", jenisBelanjaName: "Belanja Tidak Terduga", kodeRekeningRincian: "5.4.1.01.", uraianSubKegiatan: "Penanganan Keadaan Mendesak", uraian: "Belanja Tidak Terduga", anggaran: 7800000, sumberDana: "DDS" }
];

const defaultPembiayaanList: PembiayaanApbdesItem[] = [
  { id: "pem-1", type: "PENERIMAAN", kode: "6.1.1.01.", nama: "SILPA Tahun Sebelumnya", anggaran: 2491315 }
];

export function ApbdesTotalTab({ rkkdActivities, onNavigateToRkkd }: ApbdesTotalTabProps) {
  const [mounted, setMounted] = useState(false);
  const [pendapatanList, setPendapatanList] = useState<PendapatanApbdes[]>(defaultPendapatanList);
  const [belanjaList, setBelanjaList] = useState<BelanjaApbdesItem[]>(defaultBelanjaList);
  const [pembiayaanList, setPembiayaanList] = useState<PembiayaanApbdesItem[]>(defaultPembiayaanList);

  // Form Input khusus Metadata Header Kop Peraturan Desa (Persis Gambar 1)
  const [kopHeaderData, setKopHeaderData] = useState({
    nomorPerdes: "6",
    tahunPerdes: "2025",
    tahunAnggaran: "2026",
    namaDesa: "CIMANGGU I",
    kecamatan: "CIBUNGBULANG",
    kabupaten: "BOGOR",
    namaKepalaDesa: "HERNAWAN M. SODIK"
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>("ALL");

  // View Mode Switcher
  const [viewMode, setViewMode] = useState<"table" | "preview">("table");

  // Modal State for Add Belanja
  const [isAddBelanjaModalOpen, setIsAddBelanjaModalOpen] = useState(false);
  
  const [newBidangCode, setNewBidangCode] = useState<"1" | "2" | "3" | "4" | "5">("1");
  const [newSubBidangCode, setNewSubBidangCode] = useState("1.1");
  const [newSubBidangName, setNewSubBidangName] = useState("Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa");
  const [newKodeRekeningKegiatan, setNewKodeRekeningKegiatan] = useState("1.1.1");
  const [newJenisBelanjaKode, setNewJenisBelanjaKode] = useState<"5.1." | "5.2." | "5.3." | "5.4.">("5.2.");
  const [newKodeRekeningRincian, setNewKodeRekeningRincian] = useState("5.2.1.01.");
  const [newUraianSubKegiatan, setNewUraianSubKegiatan] = useState("");
  const [newUraian, setNewUraian] = useState("Belanja Barang dan Jasa");
  const [newAnggaran, setNewAnggaran] = useState<number>(0);
  const [newSumberDana, setNewSumberDana] = useState("ADD");

  // Modal State & Form for Pendapatan (Manual Budget Input & RKKD Sync)
  const [isAddPendapatanModalOpen, setIsAddPendapatanModalOpen] = useState(false);
  const [editingPendapatanId, setEditingPendapatanId] = useState<string | null>(null);
  const [pendapatanKodeInput, setPendapatanKodeInput] = useState("4.1.1.01.");
  const [pendapatanNamaInput, setPendapatanNamaInput] = useState("");
  const [pendapatanSumberDanaInput, setPendapatanSumberDanaInput] = useState("PAD");
  const [pendapatanPaguInput, setPendapatanPaguInput] = useState<number>(0);
  const [showSyncSuccessNotice, setShowSyncSuccessNotice] = useState(false);

  // Synchronized Master Lists
  const [savedKodeRekening, setSavedKodeRekening] = useState<KodeRekeningItem[]>([]);
  const [savedKodeKegiatan, setSavedKodeKegiatan] = useState<KodeKegiatanItem[]>([]);
  const [savedSumberDana, setSavedSumberDana] = useState<SumberDanaItem[]>([]);

  const syncFromRkkdStore = () => {
    const pagus = getRkkdPagus();
    const rkkdMap: Record<string, { kode: string; nama: string; pagu: number }> = {
      ADD: { kode: "4.2.3.01.", nama: "Alokasi Dana Desa", pagu: pagus.ADD },
      DDS: { kode: "4.2.1.01.", nama: "Dana Desa", pagu: pagus.DDS },
      PBH: { kode: "4.2.2.01.", nama: "Bagi Hasil Pajak dan Retribusi", pagu: pagus.PBH },
      PBP: { kode: "4.2.4.01.", nama: "Bantuan Keuangan Provinsi", pagu: pagus.PBP },
      PBK: { kode: "4.2.5.01.", nama: "Bantuan Keuangan Kabupaten", pagu: pagus.PBK },
    };

    setPendapatanList(prev => {
      const updated = [...prev];
      Object.entries(rkkdMap).forEach(([sumber, itemData]) => {
        const existingIdx = updated.findIndex(p => p.sumberDana === sumber || p.kode === itemData.kode);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            paguAnggaran: itemData.pagu
          };
        } else {
          updated.push({
            id: `pen-rkkd-${sumber.toLowerCase()}-${Date.now()}`,
            kode: itemData.kode,
            nama: itemData.nama,
            sumberDana: sumber,
            paguAnggaran: itemData.pagu
          });
        }
      });
      return updated;
    });
  };

  useEffect(() => {
    setMounted(true);
    setSavedKodeRekening(getSavedKodeRekeningList());
    setSavedKodeKegiatan(getSavedKodeKegiatanList());
    setSavedSumberDana(getSavedSumberDanaList());

    try {
      const savedPen = localStorage.getItem("apbdes_pendapatan_list_v1");
      if (savedPen) setPendapatanList(JSON.parse(savedPen));

      const savedBel = localStorage.getItem("apbdes_belanja_list_v1");
      if (savedBel) setBelanjaList(JSON.parse(savedBel));

      const savedPem = localStorage.getItem("apbdes_pembiayaan_list_v1");
      if (savedPem) setPembiayaanList(JSON.parse(savedPem));

      const savedKop = localStorage.getItem("apbdes_kop_header_v1");
      if (savedKop) setKopHeaderData(JSON.parse(savedKop));
    } catch (err) {
      console.error("Error reading localStorage:", err);
    }

    // Auto-sync real-time from RKKD store
    syncFromRkkdStore();

    window.addEventListener("rkkd_pagu_updated", syncFromRkkdStore);
    window.addEventListener("storage", syncFromRkkdStore);
    return () => {
      window.removeEventListener("rkkd_pagu_updated", syncFromRkkdStore);
      window.removeEventListener("storage", syncFromRkkdStore);
    };
  }, []);

  // Persist state updates to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("apbdes_pendapatan_list_v1", JSON.stringify(pendapatanList));
      } catch (err) {}
    }
  }, [pendapatanList, mounted]);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("apbdes_belanja_list_v1", JSON.stringify(belanjaList));
      } catch (err) {}
    }
  }, [belanjaList, mounted]);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("apbdes_pembiayaan_list_v1", JSON.stringify(pembiayaanList));
      } catch (err) {}
    }
  }, [pembiayaanList, mounted]);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("apbdes_kop_header_v1", JSON.stringify(kopHeaderData));
      } catch (err) {}
    }
  }, [kopHeaderData, mounted]);

  // Handlers for Pendapatan (Manual Input & RKKD Pagu Sync)
  const handleOpenAddPendapatanModal = () => {
    setEditingPendapatanId(null);
    setPendapatanKodeInput("4.1.1.01.");
    setPendapatanNamaInput("");
    setPendapatanSumberDanaInput("PAD");
    setPendapatanPaguInput(0);
    setIsAddPendapatanModalOpen(true);
  };

  const handleOpenEditPendapatanModal = (item: PendapatanApbdes) => {
    setEditingPendapatanId(item.id);
    setPendapatanKodeInput(item.kode);
    setPendapatanNamaInput(item.nama);
    setPendapatanSumberDanaInput(item.sumberDana);
    setPendapatanPaguInput(item.paguAnggaran);
    setIsAddPendapatanModalOpen(true);
  };

  const handleSavePendapatanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendapatanNamaInput || !pendapatanKodeInput) {
      alert("Kode Rekening dan Nama Pendapatan wajib diisi!");
      return;
    }

    if (editingPendapatanId) {
      setPendapatanList(prev => prev.map(item => item.id === editingPendapatanId ? {
        ...item,
        kode: pendapatanKodeInput,
        nama: pendapatanNamaInput,
        sumberDana: pendapatanSumberDanaInput,
        paguAnggaran: Number(pendapatanPaguInput) || 0
      } : item));
    } else {
      const newItem: PendapatanApbdes = {
        id: `pen-${Date.now()}`,
        kode: pendapatanKodeInput,
        nama: pendapatanNamaInput,
        sumberDana: pendapatanSumberDanaInput,
        paguAnggaran: Number(pendapatanPaguInput) || 0
      };
      setPendapatanList(prev => [...prev, newItem]);
    }

    setIsAddPendapatanModalOpen(false);
  };

  const handleSyncPendapatanFromRkkd = () => {
    syncFromRkkdStore();
    setShowSyncSuccessNotice(true);
    setTimeout(() => setShowSyncSuccessNotice(false), 5000);
  };

  // Dynamic Totals Calculations (Anggaran Murni)
  const totalAnggaranPendapatan = pendapatanList.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalAnggaranBelanja = belanjaList.reduce((acc, curr) => acc + curr.anggaran, 0);
  const surplusDefisitAnggaran = totalAnggaranPendapatan - totalAnggaranBelanja;

  const totalPenerimaanPembiayaan = pembiayaanList.filter(p => p.type === "PENERIMAAN").reduce((a, b) => a + b.anggaran, 0);
  const totalPengeluaranPembiayaan = pembiayaanList.filter(p => p.type === "PENGELUARAN").reduce((a, b) => a + b.anggaran, 0);
  const netPembiayaan = totalPenerimaanPembiayaan - totalPengeluaranPembiayaan;

  const silpaTahunBerjalan = surplusDefisitAnggaran + netPembiayaan;

  // Handlers
  const handleCreateBelanjaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUraianSubKegiatan || !newUraian) {
      alert("Nama Uraian Kegiatan dan Rincian Belanja wajib diisi!");
      return;
    }

    let bName = "";
    switch (newBidangCode) {
      case "1": bName = "BIDANG PENYELENGGARAN PEMERINTAHAN DESA"; break;
      case "2": bName = "BIDANG PELAKSANAAN PEMBANGUNAN DESA"; break;
      case "3": bName = "BIDANG PEMBINAAN KEMASYARAKATAN"; break;
      case "4": bName = "BIDANG PEMBERDAYAAN MASYARAKAT"; break;
      case "5": bName = "BIDANG PENANGGULANGAN BENCANA, DARURAT DAN MENDESAK DESA"; break;
    }

    let jName = "";
    switch (newJenisBelanjaKode) {
      case "5.1.": jName = "Belanja Pegawai"; break;
      case "5.2.": jName = "Belanja Barang dan Jasa"; break;
      case "5.3.": jName = "Belanja Modal"; break;
      case "5.4.": jName = "Belanja Tidak Terduga"; break;
    }

    const newItem: BelanjaApbdesItem = {
      id: `bel-custom-${Date.now()}`,
      bidangCode: newBidangCode,
      bidangName: bName,
      subBidangCode: newSubBidangCode,
      subBidangName: newSubBidangName,
      kodeRekeningKegiatan: newKodeRekeningKegiatan,
      jenisBelanjaKode: newJenisBelanjaKode,
      jenisBelanjaName: jName,
      kodeRekeningRincian: newKodeRekeningRincian,
      uraianSubKegiatan: newUraianSubKegiatan,
      uraian: newUraian,
      anggaran: newAnggaran,
      sumberDana: newSumberDana
    };

    setBelanjaList([newItem, ...belanjaList]);
    setIsAddBelanjaModalOpen(false);
  };

  const handleDeleteBelanjaItem = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus item Belanja APBDes ini?")) {
      setBelanjaList(belanjaList.filter(b => b.id !== id));
    }
  };

  // Direct Print Handler
  const handleDirectPrint = () => {
    window.print();
  };

  // Helper renderer for Source of Fund badge
  const renderSumberDanaBadge = (sumber: string) => {
    let bgClass = "bg-slate-100 text-slate-800 font-bold";
    if (sumber.includes("ADD")) bgClass = "bg-emerald-100 text-emerald-900 font-bold border border-emerald-300";
    else if (sumber.includes("DDS") || sumber.includes("DD")) bgClass = "bg-green-100 text-green-900 font-bold border border-green-300";
    else if (sumber.includes("PBH")) bgClass = "bg-amber-100 text-amber-900 font-bold border border-amber-300";
    else if (sumber.includes("PBK")) bgClass = "bg-blue-100 text-blue-900 font-bold border border-blue-300";
    else if (sumber.includes("PBP") || sumber.includes("BANPROV")) bgClass = "bg-indigo-100 text-indigo-900 font-bold border border-indigo-300";

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] ${bgClass}`}>
        {sumber}
      </span>
    );
  };

  // Renderer Header Resmi (Persis Gambar 1)
  const renderOfficialSiskeudesHeader = () => (
    <>
      {/* TOP RIGHT LAMPIRAN HEADER */}
      <div className="flex justify-end mb-6 text-[8pt] font-serif leading-tight">
        <div className="w-[95mm] text-left space-y-0.5 font-bold uppercase">
          <div>LAMPIRAN</div>
          <div>PERATURAN DESA {kopHeaderData.namaDesa}</div>
          <div>NOMOR : {kopHeaderData.nomorPerdes} TAHUN {kopHeaderData.tahunPerdes}</div>
          <div>TENTANG</div>
          <div>ANGGARAN PENDAPATAN DAN BELANJA DESA</div>
          <div>TAHUN ANGGARAN {kopHeaderData.tahunAnggaran}</div>
        </div>
      </div>

      {/* MAIN CENTERED TITLE */}
      <div className="text-center font-bold mb-6 uppercase space-y-0.5 text-[10pt] font-serif">
        <div>RANCANGAN ANGGARAN PENDAPATAN DAN BELANJA DESA</div>
        <div>PEMERINTAH DESA {kopHeaderData.namaDesa}</div>
        <div>TAHUN ANGGARAN {kopHeaderData.tahunAnggaran}</div>
      </div>
    </>
  );

  // Renderer Tabel Resmi SiskeuDes (Persis Gambar 1: 5 Kolom, Tanpa Realisasi)
  const renderOfficialSiskeudesDocumentTable = () => {
    // Dynamic Pendapatan Subtotals
    const padItems = pendapatanList.filter(p => p.kode.startsWith("4.1."));
    const padAnggaran = padItems.reduce((a, b) => a + b.paguAnggaran, 0);

    const transferItems = pendapatanList.filter(p => p.kode.startsWith("4.2."));
    const transferAnggaran = transferItems.reduce((a, b) => a + b.paguAnggaran, 0);

    const lainItems = pendapatanList.filter(p => p.kode.startsWith("4.3."));
    const lainAnggaran = lainItems.reduce((a, b) => a + b.paguAnggaran, 0);

    // Dynamic Pembiayaan Subtotals
    const pembiayaanPenerimaan = pembiayaanList.filter(p => p.type === "PENERIMAAN");
    const pembiayaanPenerimaanAnggaran = pembiayaanPenerimaan.reduce((a, b) => a + b.anggaran, 0);

    return (
      <table className="w-full border-collapse border border-black text-[7.5pt] leading-snug table-fixed font-serif">
        <colgroup>
          <col style={{ width: "14mm" }} />
          <col style={{ width: "24mm" }} />
          <col style={{ width: "110mm" }} />
          <col style={{ width: "28.9mm" }} />
          <col style={{ width: "19mm" }} />
        </colgroup>
        <thead className="table-header-group">
          <tr className="bg-[#95d35a] text-center font-bold border-b border-black text-black">
            <th className="border border-black p-1 text-center align-middle font-bold" colSpan={2}>
              KODE REKENING
            </th>
            <th className="border border-black p-1 text-center align-middle font-bold">URAIAN</th>
            <th className="border border-black p-1 text-center align-middle font-bold">ANGGARAN<br/>( Rp )</th>
            <th className="border border-black p-1 text-center align-middle font-bold">SUMBER DANA</th>
          </tr>
          <tr className="bg-white text-center font-bold text-[7pt] border-b border-black text-black">
            <td className="border border-black p-0.5 text-center font-bold">1</td>
            <td className="border border-black p-0.5 text-center font-bold">2</td>
            <td className="border border-black p-0.5 text-center font-bold">3</td>
            <td className="border border-black p-0.5 text-center font-bold">4</td>
            <td className="border border-black p-0.5 text-center font-bold">5</td>
          </tr>
        </thead>
        <tbody>
          {/* --- 4. PENDAPATAN --- */}
          <tr className="font-bold border-b border-black bg-[#95d35a] text-black">
            <td className="border border-black p-1"></td>
            <td className="border border-black p-1 font-mono font-bold">4</td>
            <td className="border border-black p-1 uppercase font-bold">PENDAPATAN</td>
            <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(totalAnggaranPendapatan)}</td>
            <td className="border border-black p-1"></td>
          </tr>

          {/* Group 4.1. PAD */}
          {padItems.length > 0 && (
            <>
              <tr className="font-bold border-b border-slate-400 bg-[#eeb32a] text-black">
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1 font-mono">4.1</td>
                <td className="border border-black p-1">Pendapatan Asli Desa</td>
                <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(padAnggaran)}</td>
                <td className="border border-black p-1"></td>
              </tr>
              {padItems.map(p => (
                <tr key={p.id} className="border-b border-slate-300">
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 font-mono">{p.kode}</td>
                  <td className="border border-black p-1">{p.nama}</td>
                  <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(p.paguAnggaran)}</td>
                  <td className="border border-black p-1 text-center font-bold text-[7.5pt]">{p.sumberDana}</td>
                </tr>
              ))}
            </>
          )}

          {/* Group 4.2. Transfer */}
          {transferItems.length > 0 && (
            <>
              <tr className="font-bold border-b border-slate-400 bg-[#eeb32a] text-black">
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1 font-mono">4.2</td>
                <td className="border border-black p-1">Transfer</td>
                <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(transferAnggaran)}</td>
                <td className="border border-black p-1"></td>
              </tr>
              {transferItems.map((p, idx) => (
                <tr key={p.id} className="border-b border-slate-300">
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 font-mono text-center"></td>
                  <td className="border border-black p-1">{idx + 1}. {p.nama}</td>
                  <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(p.paguAnggaran)}</td>
                  <td className="border border-black p-1 text-center font-bold text-[7.5pt]">{p.sumberDana}</td>
                </tr>
              ))}
            </>
          )}

          {/* Group 4.3. Lain-lain */}
          {lainItems.length > 0 && (
            <>
              <tr className="font-bold border-b border-slate-400 bg-[#eeb32a] text-black">
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1 font-mono">4.3</td>
                <td className="border border-black p-1">Pendapatan Lain-lain</td>
                <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(lainAnggaran)}</td>
                <td className="border border-black p-1"></td>
              </tr>
              {lainItems.map(p => (
                <tr key={p.id} className="border-b border-slate-300">
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 font-mono">{p.kode}</td>
                  <td className="border border-black p-1">{p.nama}</td>
                  <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(p.paguAnggaran)}</td>
                  <td className="border border-black p-1 text-center font-bold text-[7.5pt]">{p.sumberDana}</td>
                </tr>
              ))}
            </>
          )}

          <tr className="font-extrabold border-t-2 border-b-2 border-black bg-[#95d35a] text-black">
            <td className="border border-black p-1 text-center" colSpan={3}>JUMLAH PENDAPATAN</td>
            <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(totalAnggaranPendapatan)}</td>
            <td className="border border-black p-1"></td>
          </tr>

          {/* --- 5. BELANJA --- */}
          <tr className="font-bold border-b border-black bg-[#95d35a] text-black">
            <td className="border border-black p-1"></td>
            <td className="border border-black p-1 font-mono font-bold">5</td>
            <td className="border border-black p-1 uppercase font-bold">BELANJA</td>
            <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(totalAnggaranBelanja)}</td>
            <td className="border border-black p-1"></td>
          </tr>

          {/* DYNAMIC 6-LEVEL TREE SISKEUDES FOR BELANJA */}
          {(["1", "2", "3", "4", "5"] as const).map(bCode => {
            const bItems = belanjaList.filter(b => b.bidangCode === bCode);
            if (bItems.length === 0) return null;

            const bName = bItems[0].bidangName;
            const bAnggaran = bItems.reduce((a, b) => a + b.anggaran, 0);

            const subBidangCodes = Array.from(new Set(bItems.map(i => i.subBidangCode)));

            return (
              <React.Fragment key={`bid-${bCode}`}>
                {/* Level 1: BIDANG */}
                <tr className="font-bold border-b border-black bg-[#eeb32a] text-black">
                  <td className="border border-black p-1 font-mono font-black text-center">{bCode}</td>
                  <td className="border border-black p-1"></td>
                  <td className="border border-black p-1 uppercase">{bName}</td>
                  <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(bAnggaran)}</td>
                  <td className="border border-black p-1"></td>
                </tr>

                {subBidangCodes.map(sbCode => {
                  const sbItems = bItems.filter(i => i.subBidangCode === sbCode);
                  const sbName = sbItems[0].subBidangName;
                  const sbAnggaran = sbItems.reduce((a, b) => a + b.anggaran, 0);

                  const kegiatanCodes = Array.from(new Set(sbItems.map(i => i.kodeRekeningKegiatan)));

                  return (
                    <React.Fragment key={`sb-${sbCode}`}>
                      {/* Level 2: SUB-BIDANG */}
                      <tr className="font-bold border-b border-slate-400 bg-[#f2a996] text-black">
                        <td className="border border-black p-1 font-mono">{sbCode.split(".")[0]}</td>
                        <td className="border border-black p-1 font-mono">{sbCode.split(".")[1]}</td>
                        <td className="border border-black p-1">{sbName}</td>
                        <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(sbAnggaran)}</td>
                        <td className="border border-black p-1"></td>
                      </tr>

                      {kegiatanCodes.map(kegCode => {
                        const kegItems = sbItems.filter(i => i.kodeRekeningKegiatan === kegCode);
                        const kegName = kegItems[0].uraianSubKegiatan;
                        const kegAnggaran = kegItems.reduce((a, b) => a + b.anggaran, 0);

                        const uniqueSumberDana = Array.from(
                          new Set(
                            kegItems
                              .flatMap(i => i.sumberDana.split(","))
                              .map(s => s.trim())
                              .filter(Boolean)
                          )
                        ).join(", ");

                        const jenisCodes = Array.from(new Set(kegItems.map(i => i.jenisBelanjaKode)));

                        return (
                          <React.Fragment key={`keg-${kegCode}`}>
                            {/* Level 3: KEGIATAN */}
                            <tr className="font-semibold italic border-b border-slate-300">
                              <td className="border border-black p-1 font-mono">{kegCode.split(".")[0]}</td>
                              <td className="border border-black p-1 font-mono">{kegCode.split(".")[1]}</td>
                              <td className="border border-black p-1 italic">{kegName}</td>
                              <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(kegAnggaran)}</td>
                              <td className="border border-black p-1 text-center font-bold text-[7.5pt]">{uniqueSumberDana}</td>
                            </tr>

                            {jenisCodes.map(jbCode => {
                              const jbItems = kegItems.filter(i => i.jenisBelanjaKode === jbCode);
                              const jbName = jbItems[0].jenisBelanjaName;
                              const jbAnggaran = jbItems.reduce((a, b) => a + b.anggaran, 0);

                              const obyekCodes = Array.from(new Set(jbItems.map(i => getObyekCode(i.kodeRekeningRincian))));

                              return (
                                <React.Fragment key={`jb-${kegCode}-${jbCode}`}>
                                  {/* Level 4: JENIS BELANJA */}
                                  <tr className="font-bold border-b border-slate-300 text-rose-900">
                                    <td className="border border-black p-1 font-mono">{kegCode.split(".")[0]}</td>
                                    <td className="border border-black p-1 font-mono">{kegCode.split(".")[1]}</td>
                                    <td className="border border-black p-1 text-rose-900 font-bold">{jbName}</td>
                                    <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(jbAnggaran)}</td>
                                    <td className="border border-black p-1"></td>
                                  </tr>

                                  {obyekCodes.map(obCode => {
                                    const obItems = jbItems.filter(i => getObyekCode(i.kodeRekeningRincian) === obCode);
                                    const obName = obyekNameMap[obCode] || obItems[0]?.uraian || jbName;
                                    const obAnggaran = obItems.reduce((a, b) => a + b.anggaran, 0);

                                    return (
                                      <React.Fragment key={`ob-${kegCode}-${obCode}`}>
                                        {/* Level 5: OBYEK BELANJA */}
                                        <tr className="font-semibold border-b border-slate-200">
                                          <td className="border border-black p-1 font-mono text-[7.5pt]">{kegCode}</td>
                                          <td className="border border-black p-1 font-mono">{obCode}</td>
                                          <td className="border border-black p-1">{obName}</td>
                                          <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(obAnggaran)}</td>
                                          <td className="border border-black p-1"></td>
                                        </tr>

                                        {/* Level 6: RINCIAN OBYEK BELANJA */}
                                        {obItems.map(item => (
                                          <tr key={item.id} className="border-b border-slate-200">
                                            <td className="border border-black p-1 font-mono text-[7.5pt]">{item.kodeRekeningKegiatan}</td>
                                            <td className="border border-black p-1 font-mono">{item.kodeRekeningRincian}</td>
                                            <td className="border border-black p-1 pl-4 font-normal">{item.uraian}</td>
                                            <td className="border border-black p-1 text-right font-mono font-semibold">{formatAnggaranVal(item.anggaran)}</td>
                                            <td className="border border-black p-1 text-center font-bold text-[7.5pt]">{item.sumberDana}</td>
                                          </tr>
                                        ))}
                                      </React.Fragment>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}

          <tr className="font-extrabold border-t-2 border-b-2 border-black bg-[#95d35a] text-black">
            <td className="border border-black p-1 text-center" colSpan={3}>JUMLAH BELANJA</td>
            <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(totalAnggaranBelanja)}</td>
            <td className="border border-black p-1"></td>
          </tr>

          <tr className="font-extrabold border-b-2 border-black bg-[#eeb32a] text-black">
            <td className="border border-black p-1 text-center" colSpan={3}>SURPLUS / (DEFISIT)</td>
            <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(surplusDefisitAnggaran)}</td>
            <td className="border border-black p-1"></td>
          </tr>

          {/* --- 6. PEMBIAYAAN --- */}
          <tr className="font-bold border-b border-black bg-[#95d35a] text-black">
            <td className="border border-black p-1 font-mono font-bold">6</td>
            <td className="border border-black p-1"></td>
            <td className="border border-black p-1 uppercase font-bold">PEMBIAYAAN</td>
            <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(pembiayaanPenerimaanAnggaran)}</td>
            <td className="border border-black p-1"></td>
          </tr>

          {pembiayaanPenerimaan.length > 0 && (
            <>
              <tr className="font-bold border-b border-slate-400 bg-[#eeb32a] text-black">
                <td className="border border-black p-1"></td>
                <td className="border border-black p-1 font-mono">6.1</td>
                <td className="border border-black p-1">Penerimaan Pembiayaan</td>
                <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(pembiayaanPenerimaanAnggaran)}</td>
                <td className="border border-black p-1"></td>
              </tr>

              {pembiayaanPenerimaan.map(pem => (
                <tr key={pem.id} className="border-b border-slate-300">
                  <td className="border border-black p-1 font-mono text-[7.5pt]">6.1.1</td>
                  <td className="border border-black p-1 font-mono">{pem.kode}</td>
                  <td className="border border-black p-1">{pem.nama}</td>
                  <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(pem.anggaran)}</td>
                  <td className="border border-black p-1 text-center font-bold text-[7.5pt]">SILPA</td>
                </tr>
              ))}
            </>
          )}

          <tr className="font-extrabold border-t-2 border-b-2 border-black bg-[#95d35a] text-black">
            <td className="border border-black p-1 text-center" colSpan={3}>JUMLAH PEMBIAYAAN</td>
            <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(pembiayaanPenerimaanAnggaran)}</td>
            <td className="border border-black p-1"></td>
          </tr>

          <tr className="font-extrabold border-b-2 border-black bg-[#eeb32a] text-black">
            <td className="border border-black p-1 text-center" colSpan={3}>SILPA/SiLPA TAHUN BERJALAN</td>
            <td className="border border-black p-1 text-right font-mono font-bold">{formatAnggaranVal(silpaTahunBerjalan)}</td>
            <td className="border border-black p-1"></td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP SUMMARY CARDS (ON SCREEN VIEW)                         */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pendapatan</span>
            <Coins size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">Rp {totalAnggaranPendapatan.toLocaleString("id-ID")}</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">✓ Anggaran Konsolidasi Murni</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Belanja</span>
            <Banknote size={18} className="text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white">Rp {totalAnggaranBelanja.toLocaleString("id-ID")}</p>
          <p className="text-[10px] text-rose-400 font-semibold mt-1">✓ Total Alokasi Kegiatan</p>
        </div>

        <div className="bg-emerald-700 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Surplus / (Defisit)</span>
            <TrendingUp size={18} className="text-white" />
          </div>
          <p className="text-2xl font-black text-white">Rp {surplusDefisitAnggaran.toLocaleString("id-ID")}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-white/20 text-white uppercase">
            Surplus Anggaran Terjaga
          </span>
        </div>

        <div className="bg-indigo-700 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">SiLPA Tahun Berjalan</span>
            <Calculator size={18} className="text-indigo-200" />
          </div>
          <p className="text-2xl font-black text-white">Rp {silpaTahunBerjalan.toLocaleString("id-ID")}</p>
          <p className="text-[10px] text-indigo-200 font-semibold mt-1">Net Pembiayaan + Surplus</p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. FORM INPUT METADATA KOP & PERATURAN DESA (PERSIS GAMBAR 1) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm no-print space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
            <Edit3 size={16} className="text-emerald-600" /> Form Input Header Kop Peraturan Desa & Lampiran
          </h4>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 size={13} /> Terhubung Langsung ke Preview & Hasil Cetak F4
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nomor Peraturan Desa</label>
            <input
              type="text"
              value={kopHeaderData.nomorPerdes}
              onChange={(e) => setKopHeaderData({ ...kopHeaderData, nomorPerdes: e.target.value })}
              placeholder="Contoh: 6"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tahun Perdes</label>
            <input
              type="text"
              value={kopHeaderData.tahunPerdes}
              onChange={(e) => setKopHeaderData({ ...kopHeaderData, tahunPerdes: e.target.value })}
              placeholder="Contoh: 2025"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tahun Anggaran APBDes</label>
            <input
              type="text"
              value={kopHeaderData.tahunAnggaran}
              onChange={(e) => setKopHeaderData({ ...kopHeaderData, tahunAnggaran: e.target.value })}
              placeholder="Contoh: 2026"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Desa</label>
            <input
              type="text"
              value={kopHeaderData.namaDesa}
              onChange={(e) => setKopHeaderData({ ...kopHeaderData, namaDesa: e.target.value })}
              placeholder="Contoh: CIMANGGU I"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. ACTION TOOLBAR WITH VIEW SWITCHER                           */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm no-print">
        <div>
          <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <FileSpreadsheet className="text-emerald-600" size={20} /> Konsolidasi Laporan APBDes Tahun {kopHeaderData.tahunAnggaran}
          </h3>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Tabel Manajemen Data APBDes Desa {kopHeaderData.namaDesa} (Format Lampiran 1 Peraturan Desa).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Switcher Pills */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table size={15} /> Tabel Inputan Data APBDes
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "preview"
                  ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye size={15} /> Preview Dokumen SiskeuDes (F4)
            </button>
          </div>

          <button
            onClick={() => setIsAddBelanjaModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Tambah Item Belanja
          </button>

          {/* Direct Print Button */}
          <button
            onClick={handleDirectPrint}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-extrabold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <Printer size={16} /> Cetak APBDes (F4 Portrait)
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. INTERACTIVE VIEW CONTENT (TABLE vs PREVIEW)               */}
      {/* ------------------------------------------------------------- */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-sm overflow-hidden no-print">
          {/* Table Filters & Search */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Uraian, Kode Rekening, atau Sumber Dana..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {[
                { id: "ALL", label: "Semua APBDes" },
                { id: "PENDAPATAN", label: `4. Pendapatan (${pendapatanList.length})` },
                { id: "BELANJA", label: `5. Belanja (${belanjaList.length})` },
                { id: "PEMBIAYAAN", label: `6. Pembiayaan (${pembiayaanList.length})` }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilterCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilterCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sync Success Notice Toast */}
          {showSyncSuccessNotice && (
            <div className="mx-5 mt-4 p-3 bg-emerald-600 text-white font-bold text-xs rounded-2xl flex items-center justify-between shadow-lg animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={18} /> Pagu Pendapatan Transfer (ADD, DDS, PBH, PBK, PBP) berhasil disinkronkan dengan RKKD!
              </span>
              <button onClick={() => setShowSyncSuccessNotice(false)} className="text-emerald-200 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Dynamic Input Table (Tanpa Kolom Realisasi) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4 w-36">Kode Rekening</th>
                  <th className="py-3 px-4">Uraian / Kegiatan APBDes</th>
                  <th className="py-3 px-4 text-right w-44">Anggaran (Rp)</th>
                  <th className="py-3 px-4 w-32">Sumber Dana</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* Render Pendapatan Rows */}
                {(activeFilterCategory === "ALL" || activeFilterCategory === "PENDAPATAN") && (
                  <>
                    <tr className="bg-emerald-50/70 font-bold text-emerald-900 border-t-2 border-emerald-200">
                      <td className="py-2.5 px-4 font-mono font-black">4.</td>
                      <td className="py-2.5 px-4 flex items-center justify-between">
                        <span className="font-extrabold text-emerald-950">PENDAPATAN DESA</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleOpenAddPendapatanModal}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
                          >
                            <Plus size={12} /> Tambah Item Pendapatan
                          </button>
                          <button
                            onClick={handleSyncPendapatanFromRkkd}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                            title="Sinkronkan Pagu Pendapatan dengan Pagu RKKD Masing-masing Sumber Dana"
                          >
                            <RefreshCw size={12} /> Sinkronkan Pagu RKKD
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-black">Rp {totalAnggaranPendapatan.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-4">---</td>
                      <td className="py-2.5 px-4 text-center">---</td>
                    </tr>

                    {pendapatanList
                      .filter(p => !searchQuery || p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || p.kode.includes(searchQuery))
                      .map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{p.kode}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-800">{p.nama}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-700 font-mono">Rp {p.paguAnggaran.toLocaleString("id-ID")}</td>
                          <td className="py-2.5 px-4">{renderSumberDanaBadge(p.sumberDana)}</td>
                          <td className="py-2.5 px-4 text-center space-x-1">
                            <button
                              onClick={() => handleOpenEditPendapatanModal(p)}
                              className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer bg-emerald-50 rounded"
                              title="Edit Anggaran Manual / Ubah Item"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => setPendapatanList(pendapatanList.filter(item => item.id !== p.id))}
                              className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer bg-rose-50 rounded"
                              title="Hapus Item Pendapatan"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </>
                )}

                {/* Render Belanja Rows */}
                {(activeFilterCategory === "ALL" || activeFilterCategory === "BELANJA") && (
                  <>
                    <tr className="bg-rose-50/70 font-bold text-rose-900 border-t-2 border-rose-200">
                      <td className="py-2.5 px-4 font-mono font-black">5.</td>
                      <td className="py-2.5 px-4">BELANJA DESA</td>
                      <td className="py-2.5 px-4 text-right font-black">Rp {totalAnggaranBelanja.toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-4">---</td>
                      <td className="py-2.5 px-4 text-center">---</td>
                    </tr>

                    {belanjaList
                      .filter(b => !searchQuery || b.uraian.toLowerCase().includes(searchQuery.toLowerCase()) || b.uraianSubKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) || b.kodeRekeningKegiatan.includes(searchQuery) || (b.kodeRekeningRincian || "").includes(searchQuery))
                      .map(b => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 font-mono">
                            <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {b.kodeRekeningRincian || b.kodeRekeningKegiatan}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <p className="font-bold text-slate-900 text-xs">{b.uraian}</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Kegiatan {b.kodeRekeningKegiatan}: {b.uraianSubKegiatan}</p>
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-mono">Rp {b.anggaran.toLocaleString("id-ID")}</td>
                          <td className="py-2.5 px-4">{renderSumberDanaBadge(b.sumberDana)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <button onClick={() => handleDeleteBelanjaItem(b.id)} className="text-rose-400 hover:text-rose-600 p-1 cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </>
                )}

                {/* Render Pembiayaan Rows */}
                {(activeFilterCategory === "ALL" || activeFilterCategory === "PEMBIAYAAN") && (
                  <>
                    <tr className="bg-indigo-50/70 font-bold text-indigo-900 border-t-2 border-indigo-200">
                      <td className="py-2.5 px-4 font-mono font-black">6.</td>
                      <td className="py-2.5 px-4">PEMBIAYAAN DESA</td>
                      <td className="py-2.5 px-4 text-right font-black">Rp {pembiayaanList.reduce((a, b) => a + b.anggaran, 0).toLocaleString("id-ID")}</td>
                      <td className="py-2.5 px-4">---</td>
                      <td className="py-2.5 px-4 text-center">---</td>
                    </tr>

                    {pembiayaanList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-800">{p.kode}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">{p.nama}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-indigo-900 font-mono">Rp {p.anggaran.toLocaleString("id-ID")}</td>
                        <td className="py-2.5 px-4"><span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-800 font-bold">SiLPA</span></td>
                        <td className="py-2.5 px-4 text-center">---</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* INLINE DOCUMENT PREVIEW LIKE RKKD SECTION (PERSIS GAMBAR 1) */
        <div className="bg-slate-200/80 p-4 md:p-8 rounded-[2.5rem] border border-slate-300 shadow-inner flex justify-center no-print overflow-x-auto">
          <div className="bg-white text-black p-[10mm] rounded-sm shadow-2xl border border-slate-300 w-[215.9mm] min-h-[330mm] font-serif text-[8pt] leading-snug shrink-0 box-border my-2">
            {/* HEADER RESMI LAMPIRAN PERDES (PERSIS GAMBAR 1) */}
            {renderOfficialSiskeudesHeader()}

            {/* TABLE RESMI SISKEUDES PER FORMAT LAMPIRAN 1 (5 KOLOM, TANPA REALISASI) */}
            {renderOfficialSiskeudesDocumentTable()}

            {/* SIGNATURE BLOCK */}
            <div className="mt-8 flex justify-end text-center font-bold text-[9pt]">
              <div className="w-64 space-y-1 font-serif">
                <div>{kopHeaderData.kabupaten.toUpperCase()}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                <div>KEPALA DESA {kopHeaderData.namaDesa.toUpperCase()}</div>
                <div className="h-16"></div>
                <div className="underline uppercase font-extrabold">{kopHeaderData.namaKepalaDesa.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. ISOLATED PRINT CONTAINER (SAFE PORTAL FOR F4 PRINTING)       */}
      {/* ------------------------------------------------------------- */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #apbdes-print-mount-root {
            display: none !important;
          }
        }
        @media print {
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body > *:not(.siskeudes-print-portal-mount):not([id*="print-mount-root"]):not(#siskeudes-official-print-document) {
            display: none !important;
          }

          #apbdes-print-mount-root {
            display: block !important;
            visibility: visible !important;
          }

          #siskeudes-official-print-document {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            float: none !important;
            width: 195.9mm !important;
            max-width: 195.9mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #siskeudes-official-print-document table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }

          #siskeudes-official-print-document tr {
            display: table-row !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          #siskeudes-official-print-document thead {
            display: table-header-group !important;
          }

          #siskeudes-official-print-document tbody {
            display: table-row-group !important;
          }

          #siskeudes-official-print-document td, 
          #siskeudes-official-print-document th {
            display: table-cell !important;
            border-color: #000000 !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }

          @page {
            size: 215.9mm 330mm;
            margin: 10mm;
          }
        }
        `
      }} />

      <SafePrintPortal portalId="apbdes-print-mount-root">
        <div id="siskeudes-official-print-document">
          <div
            className="bg-white mx-auto text-black font-serif text-[8pt] leading-snug box-border"
            style={{
              width: "195.9mm",
              margin: "0 auto",
              fontFamily: "Cambria, 'Times New Roman', serif",
              color: "#000"
            }}
          >
            {/* HEADER RESMI SISKEUDES */}
            {renderOfficialSiskeudesHeader()}

            {/* TABLE RESMI SISKEUDES PER FORMAT LAMPIRAN 1 (5 KOLOM, TANPA REALISASI) */}
            {renderOfficialSiskeudesDocumentTable()}

            {/* SIGNATURE BLOCK */}
            <div className="mt-8 flex justify-end text-center font-bold text-[9pt] avoid-break">
              <div className="w-64 space-y-1 font-serif">
                <div>{kopHeaderData.kabupaten.toUpperCase()}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                <div>KEPALA DESA {kopHeaderData.namaDesa.toUpperCase()}</div>
                <div className="h-16"></div>
                <div className="underline uppercase font-extrabold">{kopHeaderData.namaKepalaDesa.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </div>
      </SafePrintPortal>

      {/* ------------------------------------------------------------- */}
      {/* 6. MODAL TAMBAH BELANJA APBDES WITH KODE REKENING AUTO-FILL    */}
      {/* ------------------------------------------------------------- */}
      {isAddBelanjaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" /> Tambah Item Belanja APBDes
              </h3>
              <button onClick={() => setIsAddBelanjaModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBelanjaItem} className="space-y-3 text-xs">
              <div className="space-y-2 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
                <div>
                  <label className="block font-bold text-slate-800 text-[11px] mb-1">⚡ Auto-fill Kode Bidang & Kegiatan (SiskeuDes Kab. Bogor)</label>
                  <select
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;
                      const found = savedKodeKegiatan.find(k => k.id === selectedId);
                      if (found) {
                        const bCode = found.kodeBidang.replace(/^0/, "") as any;
                        setNewBidangCode(["1","2","3","4","5"].includes(bCode) ? bCode : "1");
                        setNewSubBidangCode(found.kodeSubBidang);
                        setNewSubBidangName(found.namaSubBidang);
                        setNewKodeRekeningKegiatan(found.kodeKegiatan);
                        setNewUraianSubKegiatan(found.namaKegiatan);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-bold text-emerald-900"
                  >
                    <option value="">-- Pilih dari Master Parameter Kegiatan ({savedKodeKegiatan.length} Items) --</option>
                    {savedKodeKegiatan.map(k => (
                      <option key={k.id} value={k.id}>
                        [{k.kodeKegiatan}] {k.namaKegiatan}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-[11px] mb-1">🎯 Auto-fill dari Master Kode Output</label>
                  <select
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      if (!selectedId) return;
                      const found = savedKodeRekening.find(k => k.id === selectedId);
                      if (found) {
                        const bCode = found.kodeBidang.replace(/^0/, "") as any;
                        setNewBidangCode(["1","2","3","4","5"].includes(bCode) ? bCode : "1");
                        setNewSubBidangCode(found.kodeSubBidang);
                        setNewSubBidangName(found.namaSubBidang);
                        setNewKodeRekeningKegiatan(found.kodeKegiatan);
                        setNewUraianSubKegiatan(found.namaKegiatan);
                        setNewKodeRekeningRincian(found.kodeOutput);
                        setNewUraian(found.uraianOutput);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-white text-xs font-bold text-blue-900"
                  >
                    <option value="">-- Pilih dari Master Parameter Kode Output ({savedKodeRekening.length} Items) --</option>
                    {savedKodeRekening.map(k => (
                      <option key={k.id} value={k.id}>
                        [{k.kodeOutput}] {k.uraianOutput} - {k.namaKegiatan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bidang APBDes</label>
                  <select
                    value={newBidangCode}
                    onChange={(e) => setNewBidangCode(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border font-bold"
                  >
                    <option value="1">1. Penyelenggaraan Pemdes</option>
                    <option value="2">2. Pembangunan Desa</option>
                    <option value="3">3. Pembinaan Kemasyarakatan</option>
                    <option value="4">4. Pemberdayaan Masyarakat</option>
                    <option value="5">5. Penanggulangan Bencana/BLT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Belanja</label>
                  <select
                    value={newJenisBelanjaKode}
                    onChange={(e) => setNewJenisBelanjaKode(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border font-bold"
                  >
                    <option value="5.1.">5.1. Belanja Pegawai</option>
                    <option value="5.2.">5.2. Belanja Barang dan Jasa</option>
                    <option value="5.3.">5.3. Belanja Modal</option>
                    <option value="5.4.">5.4. Belanja Tidak Terduga</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Rekening Rincian (e.g. 5.1.1.01.)</label>
                <input
                  type="text"
                  value={newKodeRekeningRincian}
                  onChange={(e) => setNewKodeRekeningRincian(e.target.value)}
                  placeholder="Contoh: 5.1.1.01."
                  className="w-full p-2.5 rounded-xl border font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Uraian Kegiatan APBDes *</label>
                <input
                  type="text"
                  required
                  value={newUraianSubKegiatan}
                  onChange={(e) => setNewUraianSubKegiatan(e.target.value)}
                  placeholder="Contoh: Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa"
                  className="w-full p-2.5 rounded-xl border font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rincian Uraian Belanja *</label>
                <input
                  type="text"
                  required
                  value={newUraian}
                  onChange={(e) => setNewUraian(e.target.value)}
                  placeholder="Contoh: Penghasilan Tetap Kepala Desa"
                  className="w-full p-2.5 rounded-xl border font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Anggaran Pagu (Rp) *</label>
                <input
                  type="number"
                  value={newAnggaran || ""}
                  onChange={(e) => setNewAnggaran(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2.5 rounded-xl border font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sumber Dana (Tunggal)</label>
                <select
                  value={newSumberDana}
                  onChange={(e) => setNewSumberDana(e.target.value)}
                  className="w-full p-2.5 rounded-xl border font-bold"
                >
                  {savedSumberDana.map(s => (
                    <option key={s.id} value={s.kode}>
                      {s.kode} - {s.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddBelanjaModalOpen(false)} className="px-4 py-2 rounded-xl border text-slate-600 font-bold cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"><Save size={14} /> Simpan ke APBDes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. MODAL TAMBAH / EDIT ITEM PENDAPATAN (MANUAL BUDGET & SYNC)  */}
      {/* ------------------------------------------------------------- */}
      {isAddPendapatanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Coins size={18} className="text-emerald-600" /> {editingPendapatanId ? "Edit Item Pendapatan APBDes" : "Tambah Item Pendapatan APBDes"}
              </h3>
              <button onClick={() => setIsAddPendapatanModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePendapatanItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Rekening Pendapatan *</label>
                <input
                  type="text"
                  required
                  value={pendapatanKodeInput}
                  onChange={(e) => setPendapatanKodeInput(e.target.value)}
                  placeholder="Contoh: 4.1.1.01. atau 4.2.3.01."
                  className="w-full p-2.5 rounded-xl border font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Uraian Pendapatan *</label>
                <input
                  type="text"
                  required
                  value={pendapatanNamaInput}
                  onChange={(e) => setPendapatanNamaInput(e.target.value)}
                  placeholder="Contoh: Hasil Usaha Desa / Alokasi Dana Desa"
                  className="w-full p-2.5 rounded-xl border font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sumber Dana (Tunggal)</label>
                <select
                  value={pendapatanSumberDanaInput}
                  onChange={(e) => setPendapatanSumberDanaInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border font-bold"
                >
                  {savedSumberDana.map(s => (
                    <option key={s.id} value={s.kode}>
                      {s.kode} - {s.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Anggaran Pagu (Rp) - Ketik Manual *</label>
                <input
                  type="number"
                  required
                  value={pendapatanPaguInput || ""}
                  onChange={(e) => setPendapatanPaguInput(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2.5 rounded-xl border font-mono font-extrabold text-emerald-700 text-sm focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  💡 Anggaran ini dapat diketik manual atau disinkronkan langsung dari fitur RKKD (ADD, DD, BHPRD, Bankeu).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddPendapatanModalOpen(false)} className="px-4 py-2 rounded-xl border text-slate-600 font-bold cursor-pointer">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-md"><Save size={14} /> Simpan Item Pendapatan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
