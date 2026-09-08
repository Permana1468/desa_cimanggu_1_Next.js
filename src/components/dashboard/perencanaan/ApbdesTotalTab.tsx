"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Sparkles,
  PieChart,
  Plus,
  Trash2,
  RefreshCw,
  X
} from "lucide-react";

export interface PendapatanApbdes {
  id: string;
  kode: string;
  nama: string;
  sumberDana: "DD" | "ADD" | "BHPRD" | "BANKEU_PROV" | "BANKEU_KAB" | "PADES" | "DLL";
  paguAnggaran: number;
}

export interface BelanjaApbdesItem {
  id: string;
  bidangCode: "1" | "2" | "3" | "4" | "5";
  bidangName: string;
  subBidangCode: string;
  subBidangName: string;
  kodeRekeningKegiatan: string; // e.g. "01", "02", "13"
  jenisBelanjaKode: "5 1" | "5 2" | "5 3" | "5 4"; // 5 1 Pegawai, 5 2 Barang Jasa, 5 3 Modal, 5 4 Tak Terduga
  jenisBelanjaName: string;
  uraianSubKegiatan?: string; // e.g. "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa"
  uraian: string; // e.g. "Belanja Pegawai"
  anggaran: number;
  sumberDana: string; // e.g. "ADD, PBH", "DD", "PBK", "PBP", "DDS"
}

export interface KegiatanRkkdRef {
  id: string;
  kodeKegiatan: string;
  bidang: string;
  namaKegiatan: string;
  lokasi?: string;
  sumberDana: "ADD" | "DD" | "BHPRD" | "BANKEU" | "PADes" | "DLL";
  paguAnggaran: number;
}

interface ApbdesTotalTabProps {
  rkkdActivities: KegiatanRkkdRef[];
  onNavigateToRkkd?: (subTab: string) => void;
}

// Data awal Pagu Pendapatan Desa (Persis User Image - PDF Page 1)
const defaultPendapatanList: PendapatanApbdes[] = [
  { id: "pend-1", kode: "4.1", nama: "Pendapatan Asli Desa", sumberDana: "PADES", paguAnggaran: 0 },
  { id: "pend-2", kode: "4.2.1", nama: "1. Dana Desa", sumberDana: "DD", paguAnggaran: 1530723000 },
  { id: "pend-3", kode: "4.2.2", nama: "2. Bagi Hasil Pajak dan Retribusi", sumberDana: "BHPRD", paguAnggaran: 445623299 },
  { id: "pend-4", kode: "4.2.3", nama: "3. Alokasi Dana Desa", sumberDana: "ADD", paguAnggaran: 916400000 },
  { id: "pend-5", kode: "4.2.4", nama: "4. Bantuan Keuangan Provinsi", sumberDana: "BANKEU_PROV", paguAnggaran: 130000000 },
  { id: "pend-6", kode: "4.2.5", nama: "5. Bantuan Keuangan Kabupaten", sumberDana: "BANKEU_KAB", paguAnggaran: 1500000000 },
  { id: "pend-7", kode: "4.3", nama: "Pendapatan Lain-lain", sumberDana: "DLL", paguAnggaran: 0 }
];

// Data awal Belanja APBDes (Persis Gambar Lampiran User)
const defaultBelanjaList: BelanjaApbdesItem[] = [
  // BIDANG 1: Penyelenggaraan Pemdes
  { id: "bel-1", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "01", jenisBelanjaKode: "5 1", jenisBelanjaName: "Belanja Pegawai", uraianSubKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa", uraian: "Belanja Pegawai", anggaran: 74000000, sumberDana: "ADD, PBH" },
  { id: "bel-2", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "02", jenisBelanjaKode: "5 1", jenisBelanjaName: "Belanja Pegawai", uraianSubKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Perangkat Desa", uraian: "Belanja Pegawai", anggaran: 406400000, sumberDana: "ADD, PBH" },
  { id: "bel-3", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "03", jenisBelanjaKode: "5 1", jenisBelanjaName: "Belanja Pegawai", uraianSubKegiatan: "Penyediaan Jaminan Sosial bagi Kepala Desa dan Perangkat Desa", uraian: "Belanja Pegawai", anggaran: 19169280, sumberDana: "PBH" },
  { id: "bel-4", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "04", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honorarium PKPKD dan PPKD, perlengkapan perkantoran, pakaian dinas/ atribut, listrik/telpon, dll)", uraian: "Belanja Barang dan Jasa", anggaran: 88193619, sumberDana: "ADD, PBH" },
  { id: "bel-5", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "05", jenisBelanjaKode: "5 1", jenisBelanjaName: "Belanja Pegawai", uraianSubKegiatan: "Penyediaan Tunjangan BPD", uraian: "Belanja Pegawai", anggaran: 92400000, sumberDana: "ADD" },
  { id: "bel-6", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "06", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyediaan Operasional BPD (ATK, perlengkapan perkantoran, Pakaian Seragam, listrik/telpon, dll)", uraian: "Belanja Barang dan Jasa", anggaran: 14166400, sumberDana: "ADD,PBH,PBP" },
  { id: "bel-7", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "07", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyediaan Insentif/Operasional RT/RW", uraian: "Belanja Barang dan Jasa", anggaran: 295200000, sumberDana: "ADD" },
  { id: "bel-8", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "07", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyediaan Operasional Pemerintah Desa yang Bersumber dari Dana Desa", uraian: "Belanja Barang dan Jasa", anggaran: 33902000, sumberDana: "DD, PBH" },
  { id: "bel-9", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 1", subBidangName: "Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa", kodeRekeningKegiatan: "90", jenisBelanjaKode: "5 1", jenisBelanjaName: "Belanja Pegawai", uraianSubKegiatan: "Peningkatan Fungsi Pelayanan Pemdes dan TPAPD", uraian: "Belanja Pegawai", anggaran: 25000000, sumberDana: "PBP" },
  { id: "bel-10", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 2", subBidangName: "Sarana dan Prasarana Pemerintahan Desa", kodeRekeningKegiatan: "01", jenisBelanjaKode: "5 3", jenisBelanjaName: "Belanja Modal", uraianSubKegiatan: "Penyediaan sarana (aset tetap) perkantoran/pemerintahan", uraian: "Belanja Modal", anggaran: 50920000, sumberDana: "PBH" },
  { id: "bel-11", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 2", subBidangName: "Sarana dan Prasarana Pemerintahan Desa", kodeRekeningKegiatan: "02", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Pemeliharaan Gedung/Prasarana Kantor Desa", uraian: "Belanja Barang dan Jasa", anggaran: 12320000, sumberDana: "PBH" },
  { id: "bel-12", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 3", subBidangName: "Administrasi Kependudukan, Pencatatan Sipil, Statistik dan Kearsipan", kodeRekeningKegiatan: "05", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Pemetaan dan Analisis Kemiskinan Desa secara Partisipatif", uraian: "Belanja Barang dan Jasa", anggaran: 12000000, sumberDana: "PBH" },
  { id: "bel-13", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 4", subBidangName: "Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "01", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyelenggaraan Musyawarah Perencanaan Desa/Pembahasan APBDes", uraian: "Belanja Barang dan Jasa", anggaran: 12500000, sumberDana: "PBH" },
  { id: "bel-14", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 4", subBidangName: "Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "03", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyusunan Dokumen Perencanaan Desa (RPJMDes/RKPDes,dll)", uraian: "Belanja Barang dan Jasa", anggaran: 2500000, sumberDana: "PBH" },
  { id: "bel-15", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 4", subBidangName: "Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "04", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyusunan Dokumen Keuangan Desa (APBDes/ APBDes Perubahan/ LPJ APBDes)", uraian: "Belanja Barang dan Jasa", anggaran: 2500000, sumberDana: "PBH" },
  { id: "bel-16", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 4", subBidangName: "Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "07", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyusunan Laporan Kepala Desa/Penyelenggaraan Pemerintahan Desa", uraian: "Belanja Barang dan Jasa", anggaran: 5000000, sumberDana: "PBH" },
  { id: "bel-17", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 4", subBidangName: "Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeRekeningKegiatan: "08", jenisBelanjaKode: "5 3", jenisBelanjaName: "Belanja Modal", uraianSubKegiatan: "Pengembangan Sistem Informasi Desa", uraian: "Belanja Modal", anggaran: 20000000, sumberDana: "DD" },
  { id: "bel-18", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 5", subBidangName: "Pertanahan", kodeRekeningKegiatan: "02", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Administrasi Pertanahan (Pendaftaran Tanah, dan Pemberian Registrasi)", uraian: "Belanja Barang dan Jasa", anggaran: 2000000, sumberDana: "PBH" },
  { id: "bel-19", bidangCode: "1", bidangName: "Penyelenggaraan Pemerintahan Desa", subBidangCode: "1 5", subBidangName: "Pertanahan", kodeRekeningKegiatan: "06", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Administrasi Pajak Bumi dan Bangunan (PBB)", uraian: "Belanja Barang dan Jasa", anggaran: 199000, sumberDana: "PBH" },

  // BIDANG 2: Pembangunan Desa
  { id: "bel-20", bidangCode: "2", bidangName: "Pelaksanaan Pembangunan Desa", subBidangCode: "2 2", subBidangName: "Kesehatan", kodeRekeningKegiatan: "02", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyelenggaraan Posyandu (Makanan Tambahan, Kelas Ibu Hamil, Kelas Lansia, Insentif Kader Posyandu)", uraian: "Belanja Barang dan Jasa", anggaran: 188520000, sumberDana: "ADD, PBH, DD" },
  { id: "bel-21", bidangCode: "2", bidangName: "Pelaksanaan Pembangunan Desa", subBidangCode: "2 3", subBidangName: "Pekerjaan Umum dan Penataan Ruang", kodeRekeningKegiatan: "01", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Pemeliharaan Jalan Desa", uraian: "Belanja Barang dan Jasa", anggaran: 15000000, sumberDana: "DD" },
  { id: "bel-22", bidangCode: "2", bidangName: "Pelaksanaan Pembangunan Desa", subBidangCode: "2 3", subBidangName: "Pekerjaan Umum dan Penataan Ruang", kodeRekeningKegiatan: "10", jenisBelanjaKode: "5 3", jenisBelanjaName: "Belanja Modal", uraianSubKegiatan: "Pembangunan/Rehabilitasi/Peningkatan/Pengerasan Jalan Lingkungan Permukiman/Gang", uraian: "Belanja Modal", anggaran: 298812000, sumberDana: "DD, PBP" },
  { id: "bel-23", bidangCode: "2", bidangName: "Pelaksanaan Pembangunan Desa", subBidangCode: "2 3", subBidangName: "Pekerjaan Umum dan Penataan Ruang", kodeRekeningKegiatan: "13", jenisBelanjaKode: "5 3", jenisBelanjaName: "Belanja Modal", uraianSubKegiatan: "Pembangunan/Rehabilitasi/Peningkatan Prasarana Jalan Desa (Gorong-gorong, Selokan, Box/Slab Culvert, Drainase, Prasarana Jalan lain)", uraian: "Belanja Modal", anggaran: 1077886000, sumberDana: "DD, PBK" },
  { id: "bel-24", bidangCode: "2", bidangName: "Pelaksanaan Pembangunan Desa", subBidangCode: "2 4", subBidangName: "Kawasan Permukiman", kodeRekeningKegiatan: "01", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Dukungan pelaksanaan program Pembangunan/Rehab Rumah Tidak Layak Huni (RTLH) GAKIN", uraian: "Belanja Barang dan Jasa", anggaran: 100000000, sumberDana: "DDS" },
  { id: "bel-25", bidangCode: "2", bidangName: "Pelaksanaan Pembangunan Desa", subBidangCode: "2 6", subBidangName: "Perhubungan, Komunikasi, dan Informatika", kodeRekeningKegiatan: "90-99", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "lain-lain kegiatan sub bidang Perhubungan, Komunikasi, dan Informatika*", uraian: "Belanja Barang dan Jasa", anggaran: 120000000, sumberDana: "PBK" },

  // BIDANG 3: Pembinaan Kemasyarakatan
  { id: "bel-26", bidangCode: "3", bidangName: "Pembinaan Kemasyarakatan Desa", subBidangCode: "3 1", subBidangName: "Ketenteraman, Ketertiban Umum, dan Pelindungan Masyarakat", kodeRekeningKegiatan: "04", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Pelatihan Kesiapsiagaan/Tanggap Bencana Skala Lokal Desa", uraian: "Belanja Barang dan Jasa", anggaran: 28800000, sumberDana: "DD" },
  { id: "bel-27", bidangCode: "3", bidangName: "Pembinaan Kemasyarakatan Desa", subBidangCode: "3 1", subBidangName: "Ketenteraman, Ketertiban Umum, dan Pelindungan Masyarakat", kodeRekeningKegiatan: "07", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyediaan Insentif/Oprasional Linmas", uraian: "Belanja Barang dan Jasa", anggaran: 36000000, sumberDana: "ADD" },
  { id: "bel-28", bidangCode: "3", bidangName: "Pembinaan Kemasyarakatan Desa", subBidangCode: "3 2", subBidangName: "Kebudayaan dan Keagamaan", kodeRekeningKegiatan: "03", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyelenggaraan Festival Kesenian, Adat/Kebudayaan, dan Keagamaan", uraian: "Belanja Barang dan Jasa", anggaran: 71915000, sumberDana: "PBH" },
  { id: "bel-29", bidangCode: "3", bidangName: "Pembinaan Kemasyarakatan Desa", subBidangCode: "3 2", subBidangName: "Kebudayaan dan Keagamaan", kodeRekeningKegiatan: "90", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Penyuluhan dan Pendampingan Keagamaan", uraian: "Belanja Barang dan Jasa", anggaran: 60000000, sumberDana: "ADD" },
  { id: "bel-30", bidangCode: "3", bidangName: "Pembinaan Kemasyarakatan Desa", subBidangCode: "3 3", subBidangName: "Kepemudaan dan Olah Raga", kodeRekeningKegiatan: "06", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Pembinaan Karang Taruna/Klub Kepemudaan/Klub Olah raga", uraian: "Belanja Barang dan Jasa", anggaran: 3000000, sumberDana: "PBH" },
  { id: "bel-31", bidangCode: "3", bidangName: "Pembinaan Kemasyarakatan Desa", subBidangCode: "3 4", subBidangName: "Kelembagaan Masyarakat", kodeRekeningKegiatan: "02", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Pembinaan LKMD/LPM/LPMD", uraian: "Belanja Barang dan Jasa", anggaran: 28200000, sumberDana: "PBH" },
  { id: "bel-32", bidangCode: "3", bidangName: "Pembinaan Kemasyarakatan Desa", subBidangCode: "3 4", subBidangName: "Kelembagaan Masyarakat", kodeRekeningKegiatan: "03", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Pembinaan PKK", uraian: "Belanja Barang dan Jasa", anggaran: 45840000, sumberDana: "PBH" },

  // BIDANG 4: Pemberdayaan Masyarakat
  { id: "bel-33", bidangCode: "4", bidangName: "Pemberdayaan Masyarakat Desa", subBidangCode: "4 3", subBidangName: "Peningkatan Kapasitas Aparatur Desa", kodeRekeningKegiatan: "01", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Peningkatan kapasitas kepala Desa", uraian: "Belanja Barang dan Jasa", anggaran: 10000000, sumberDana: "PBH" },
  { id: "bel-34", bidangCode: "4", bidangName: "Pemberdayaan Masyarakat Desa", subBidangCode: "4 5", subBidangName: "Koperasi, Usaha Mikro Kecil dan Menengah (UMKM)", kodeRekeningKegiatan: "01", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "Pelatihan Manajemen Pengelolaan Koperasi/ KUD/ UMKM", uraian: "Belanja Barang dan Jasa", anggaran: 11375000, sumberDana: "DD" },
  { id: "bel-35", bidangCode: "4", bidangName: "Pemberdayaan Masyarakat Desa", subBidangCode: "4 6", subBidangName: "Dukungan Penanaman Modal", kodeRekeningKegiatan: "90-99", jenisBelanjaKode: "5 2", jenisBelanjaName: "Belanja Barang dan Jasa", uraianSubKegiatan: "lain-lain kegiatan sub bidang Penanaman Modal*", uraian: "Belanja Barang dan Jasa", anggaran: 534888000, sumberDana: "DD" },

  // BIDANG 5: Penanggulangan Bencana / BLT
  { id: "bel-36", bidangCode: "5", bidangName: "Penanggulangan Bencana, Keadaan Darurat dan Mendesak", subBidangCode: "5 3", subBidangName: "Keadaan Mendesak", kodeRekeningKegiatan: "00", jenisBelanjaKode: "5 4", jenisBelanjaName: "Belanja Tak Terduga", uraianSubKegiatan: "Penanggulangan Bencana (BLT Dana Desa)", uraian: "Belanja Tak Terduga", anggaran: 226800000, sumberDana: "DD" }
];

export function ApbdesTotalTab({ rkkdActivities, onNavigateToRkkd }: ApbdesTotalTabProps) {
  const [pendapatanList, setPendapatanList] = useState<PendapatanApbdes[]>(defaultPendapatanList);
  const [belanjaList, setBelanjaList] = useState<BelanjaApbdesItem[]>(defaultBelanjaList);
  const [mounted, setMounted] = useState(false);

  // Form State Modal Pendapatan
  const [isEditingPagu, setIsEditingPagu] = useState(false);
  const [tempPendapatan, setTempPendapatan] = useState<PendapatanApbdes[]>(defaultPendapatanList);

  // Form State Modal Tambah Belanja APBDes
  const [isAddBelanjaModalOpen, setIsAddBelanjaModalOpen] = useState(false);
  const [newBidangCode, setNewBidangCode] = useState<"1" | "2" | "3" | "4" | "5">("1");
  const [newSubBidangCode, setNewSubBidangCode] = useState("1 1");
  const [newSubBidangName, setNewSubBidangName] = useState("Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemerintahan Desa");
  const [newKodeRekeningKegiatan, setNewKodeRekeningKegiatan] = useState("01");
  const [newJenisBelanjaKode, setNewJenisBelanjaKode] = useState<"5 1" | "5 2" | "5 3" | "5 4">("5 2");
  const [newUraianSubKegiatan, setNewUraianSubKegiatan] = useState("");
  const [newUraian, setNewUraian] = useState("Belanja Barang dan Jasa");
  const [newAnggaran, setNewAnggaran] = useState<number>(0);
  const [newSumberDana, setNewSumberDana] = useState("ADD, PBH");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Total Pagu Pendapatan
  const totalPendapatan = pendapatanList.reduce((acc, curr) => acc + curr.paguAnggaran, 0);

  // Total Belanja per Bidang
  const totalBidang1 = belanjaList.filter(b => b.bidangCode === "1").reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalBidang2 = belanjaList.filter(b => b.bidangCode === "2").reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalBidang3 = belanjaList.filter(b => b.bidangCode === "3").reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalBidang4 = belanjaList.filter(b => b.bidangCode === "4").reduce((acc, curr) => acc + curr.anggaran, 0);
  const totalBidang5 = belanjaList.filter(b => b.bidangCode === "5").reduce((acc, curr) => acc + curr.anggaran, 0);

  const totalBelanja = totalBidang1 + totalBidang2 + totalBidang3 + totalBidang4 + totalBidang5;
  const surplusDefisit = totalPendapatan - totalBelanja;

  const formatRupiah = (val: number) => val.toLocaleString("id-ID");

  const handleSavePaguManual = () => {
    setPendapatanList(tempPendapatan);
    setIsEditingPagu(false);
  };

  const handleCreateBelanjaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUraian || !newAnggaran) return;

    let bName = "Penyelenggaraan Pemerintahan Desa";
    if (newBidangCode === "2") bName = "Pelaksanaan Pembangunan Desa";
    if (newBidangCode === "3") bName = "Pembinaan Kemasyarakatan Desa";
    if (newBidangCode === "4") bName = "Pemberdayaan Masyarakat Desa";
    if (newBidangCode === "5") bName = "Penanggulangan Bencana, Keadaan Darurat dan Mendesak";

    let jName = "Belanja Barang dan Jasa";
    if (newJenisBelanjaKode === "5 1") jName = "Belanja Pegawai";
    if (newJenisBelanjaKode === "5 3") jName = "Belanja Modal";
    if (newJenisBelanjaKode === "5 4") jName = "Belanja Tak Terduga";

    const newItem: BelanjaApbdesItem = {
      id: `bel-${Date.now()}`,
      bidangCode: newBidangCode,
      bidangName: bName,
      subBidangCode: newSubBidangCode,
      subBidangName: newSubBidangName,
      kodeRekeningKegiatan: newKodeRekeningKegiatan,
      jenisBelanjaKode: newJenisBelanjaKode,
      jenisBelanjaName: jName,
      uraianSubKegiatan: newUraianSubKegiatan || newUraian,
      uraian: jName,
      anggaran: Number(newAnggaran) || 0,
      sumberDana: newSumberDana
    };

    setBelanjaList([...belanjaList, newItem]);
    setIsAddBelanjaModalOpen(false);
    setNewUraianSubKegiatan("");
    setNewAnggaran(0);
  };

  // Helper SUMBER DANA FULL-CELL BACKGROUND (PERSIS USER SCREENSHOT)
  const renderSumberDanaTd = (sumber: string) => {
    if (!sumber) return <td className="border border-black p-0.5 text-center font-bold"></td>;

    let bgClass = "bg-white text-slate-900";
    if (sumber.includes("ADD, PBH")) bgClass = "bg-[#00a0e9] text-white font-bold";
    else if (sumber === "PBH") bgClass = "bg-[#007cc3] text-white font-bold";
    else if (sumber === "ADD") bgClass = "bg-white text-rose-600 font-bold";
    else if (sumber.includes("ADD,PBH,PBP") || sumber.includes("ADD, PBH, PBP")) bgClass = "bg-[#ff8a80] text-rose-950 font-bold";
    else if (sumber.includes("DD, PBH")) bgClass = "bg-[#e65100] text-white font-bold";
    else if (sumber === "PBP") bgClass = "bg-[#00e5ff] text-[#002f6c] font-bold";
    else if (sumber.includes("DD") || sumber.includes("DDS")) bgClass = "bg-[#2e7d32] text-white font-bold";
    else if (sumber.includes("PBK")) bgClass = "bg-[#0288d1] text-white font-bold";

    return (
      <td className={`border border-black p-0.5 text-center text-[7.5pt] font-sans uppercase font-bold tracking-tight ${bgClass}`}>
        {sumber}
      </td>
    );
  };

  const renderApbdesDocument = (isPortal = false) => (
    <div
      id={isPortal ? "apbdes-print-portal" : "apbdes-print"}
      className="bg-white mx-auto shadow-2xl text-black font-serif relative"
      style={{
        width: "215.9mm",
        minHeight: "330.2mm",
        padding: "12mm 12mm",
        fontFamily: "Cambria, 'Times New Roman', Georgia, serif",
        color: "#000",
        boxSizing: "border-box",
        fontSize: "8.5pt",
        lineHeight: "1.2"
      }}
    >
      {/* HEADER PERATURAN DESA CIMANGGU I */}
      <div className="flex justify-end text-[8.5pt] font-semibold mb-3 uppercase text-right leading-tight">
        <div>
          <div>LAMPIRAN</div>
          <div>PERATURAN DESA CIMANGGU I</div>
          <div>NOMOR : 6 TAHUN 2025</div>
          <div>TENTANG</div>
          <div>ANGGARAN PENDAPATAN DAN BELANJA DESA</div>
          <div>TAHUN ANGGARAN 2026</div>
        </div>
      </div>

      <div className="text-center font-extrabold text-[11pt] mb-3 uppercase tracking-wide leading-snug">
        <div>RANCANGAN ANGGARAN PENDAPATAN DAN BELANJA DESA</div>
        <div>PEMERINTAH DESA CIMANGGU I</div>
        <div>TAHUN ANGGARAN 2026</div>
      </div>

      {/* TABEL RESMI APBDES PERMENDAGRI 20 (DENGAN COLGROUP PRESISI PERSIS GAMBAR USER) */}
      <table className="w-full border-collapse border border-black text-[8.5pt] mb-6">
        <colgroup>
          <col style={{ width: "20px" }} />
          <col style={{ width: "20px" }} />
          <col style={{ width: "28px" }} />
          <col style={{ width: "20px" }} />
          <col style={{ width: "20px" }} />
          <col style={{ width: "auto" }} />
          <col style={{ width: "125px" }} />
          <col style={{ width: "100px" }} />
        </colgroup>
        <thead>
          {/* BARIS HEADER 1 */}
          <tr className="bg-[#8bc34a] text-black font-extrabold text-center border-b border-black uppercase">
            <th className="border border-black p-1 text-center" colSpan={5}>KODE REKENING</th>
            <th className="border border-black p-1 text-center font-black" rowSpan={3}>URAIAN</th>
            <th className="border border-black p-1 text-center font-black" rowSpan={3}>ANGGARAN</th>
            <th className="border border-black p-1 text-center font-black" rowSpan={3}>SUMBER DANA</th>
          </tr>
          {/* BARIS HEADER 2 */}
          <tr className="bg-white text-black font-extrabold text-center border-b border-black text-[8pt]">
            <th className="border border-black p-0.5 text-center" colSpan={3}>1</th>
            <th className="border border-black p-0.5 text-center" colSpan={2}>2</th>
          </tr>
          {/* BARIS HEADER 3 */}
          <tr className="bg-white text-black font-extrabold text-center border-b border-black text-[7.5pt]">
            <th className="border border-black p-0.5">a</th>
            <th className="border border-black p-0.5">b</th>
            <th className="border border-black p-0.5">c</th>
            <th className="border border-black p-0.5">a</th>
            <th className="border border-black p-0.5">b</th>
          </tr>
        </thead>
        <tbody>
          {/* 4 PENDAPATAN */}
          <tr className="bg-[#8bc34a] font-extrabold border-b border-black">
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center font-black">4</td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-1 font-black uppercase">PENDAPATAN</td>
            <td className="border border-black p-1 text-right font-mono font-black pr-1">{formatRupiah(totalPendapatan)}</td>
            <td className="border border-black p-0.5"></td>
          </tr>

          {/* 4 1 Pendapatan Asli Desa */}
          <tr className="bg-[#fbc02d] font-extrabold border-b border-black">
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center font-black">4</td>
            <td className="border border-black p-0.5 text-center font-black">1</td>
            <td className="border border-black p-1 font-black">Pendapatan Asli Desa</td>
            <td className="border border-black p-1 text-right font-mono font-black pr-1">-</td>
            <td className="border border-black p-0.5"></td>
          </tr>

          {/* 4 2 Transfer */}
          <tr className="bg-[#fbc02d] font-extrabold border-b border-black">
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center font-black">4</td>
            <td className="border border-black p-0.5 text-center font-black">2</td>
            <td className="border border-black p-1 font-black">Transfer</td>
            <td className="border border-black p-1 text-right font-mono font-black pr-1">{formatRupiah(totalPendapatan)}</td>
            <td className="border border-black p-0.5"></td>
          </tr>

          {/* Transfer Items */}
          {pendapatanList.filter(p => p.paguAnggaran > 0).map((p) => (
            <tr key={p.id} className="border-b border-black">
              <td className="border border-black p-0.5"></td>
              <td className="border border-black p-0.5"></td>
              <td className="border border-black p-0.5"></td>
              <td className="border border-black p-0.5"></td>
              <td className="border border-black p-0.5"></td>
              <td className="border border-black p-1 pl-4 font-normal text-slate-900">{p.nama}</td>
              <td className="border border-black p-1 text-right font-mono font-medium pr-1">{formatRupiah(p.paguAnggaran)}</td>
              <td className="border border-black p-0.5 text-center"></td>
            </tr>
          ))}

          {/* 4 3 Pendapatan Lain-lain */}
          <tr className="bg-[#fbc02d] font-extrabold border-b border-black">
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center font-black">4</td>
            <td className="border border-black p-0.5 text-center font-black">3</td>
            <td className="border border-black p-1 font-black">Pendapatan Lain-lain</td>
            <td className="border border-black p-1 text-right font-mono font-black pr-1">-</td>
            <td className="border border-black p-0.5"></td>
          </tr>

          {/* JUMLAH PENDAPATAN */}
          <tr className="bg-[#8bc34a] font-extrabold border-b border-black">
            <td className="border border-black p-0.5" colSpan={5}></td>
            <td className="border border-black p-1 font-black uppercase">JUMLAH PENDAPATAN</td>
            <td className="border border-black p-1 text-right font-mono font-black pr-1">{formatRupiah(totalPendapatan)}</td>
            <td className="border border-black p-0.5"></td>
          </tr>

          {/* 5 BELANJA */}
          <tr className="bg-[#8bc34a] font-extrabold border-b border-black">
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-0.5 text-center font-black">5</td>
            <td className="border border-black p-0.5 text-center"></td>
            <td className="border border-black p-1 font-black uppercase">BELANJA</td>
            <td className="border border-black p-1 text-right font-mono font-black pr-1">{formatRupiah(totalBelanja)}</td>
            <td className="border border-black p-0.5"></td>
          </tr>

          {/* BIDANG 1 SAMPAI 5 */}
          {(["1", "2", "3", "4", "5"] as const).map((bCode) => {
            const bItems = belanjaList.filter(b => b.bidangCode === bCode);
            const bTotal = bItems.reduce((acc, curr) => acc + curr.anggaran, 0);
            if (bItems.length === 0 && bTotal === 0) return null;

            const subBidangCodes = Array.from(new Set(bItems.map(i => i.subBidangCode)));

            return (
              <React.Fragment key={bCode}>
                {/* BIDANG ROW (ORANGE PERSIS GAMBAR USER) */}
                <tr className="bg-[#ffa726] font-extrabold border-b border-black text-black">
                  <td className="border border-black p-0.5 text-center font-black">{bCode}</td>
                  <td className="border border-black p-0.5 text-center"></td>
                  <td className="border border-black p-0.5 text-center"></td>
                  <td className="border border-black p-0.5 text-center"></td>
                  <td className="border border-black p-0.5 text-center"></td>
                  <td className="border border-black p-1 font-black uppercase">
                    {bCode === "1" && "Penyelenggaraan Pemerintahan Desa"}
                    {bCode === "2" && "Pelaksanaan Pembangunan Desa"}
                    {bCode === "3" && "Pembinaan Kemasyarakatan Desa"}
                    {bCode === "4" && "Pemberdayaan Masyarakat Desa"}
                    {bCode === "5" && "PENANGGULANGAN BENCANA, KEADAAN DARURAT DAN MENDESAK"}
                  </td>
                  <td className="border border-black p-1 text-right font-mono font-black pr-1">{formatRupiah(bTotal)}</td>
                  <td className="border border-black p-0.5"></td>
                </tr>

                {/* SUB BIDANG & KEGIATAN */}
                {subBidangCodes.map((subCode) => {
                  const subItems = bItems.filter(i => i.subBidangCode === subCode);
                  const subTotal = subItems.reduce((acc, curr) => acc + curr.anggaran, 0);
                  const firstSub = subItems[0];
                  const parts = subCode.split(" ");

                  return (
                    <React.Fragment key={subCode}>
                      {/* SUB BIDANG ROW (PEACH/LIGHT ORANGE PERSIS GAMBAR USER) */}
                      <tr className="bg-[#ffcc80] font-extrabold italic border-b border-black text-black">
                        <td className="border border-black p-0.5 text-center font-black">{parts[0]}</td>
                        <td className="border border-black p-0.5 text-center font-black">{parts[1]}</td>
                        <td className="border border-black p-0.5 text-center"></td>
                        <td className="border border-black p-0.5 text-center"></td>
                        <td className="border border-black p-0.5 text-center"></td>
                        <td className="border border-black p-1 font-black italic">{firstSub?.subBidangName}</td>
                        <td className="border border-black p-1 text-right font-mono font-black pr-1">{formatRupiah(subTotal)}</td>
                        <td className="border border-black p-0.5"></td>
                      </tr>

                      {/* SUB KEGIATAN & RINCIAN BELANJA */}
                      {subItems.map((item) => {
                        const jParts = item.jenisBelanjaKode.split(" ");

                        return (
                          <React.Fragment key={item.id}>
                            {/* SUB-KEGIATAN ROW (ITALIC DARK TEXT) */}
                            <tr className="border-b border-black h-[22px]">
                              <td className="border border-black p-0.5 text-center font-mono font-semibold">{parts[0]}</td>
                              <td className="border border-black p-0.5 text-center font-mono font-semibold">{parts[1]}</td>
                              <td className="border border-black p-0.5 text-center font-mono font-semibold">{item.kodeRekeningKegiatan}</td>
                              <td className="border border-black p-0.5 text-center"></td>
                              <td className="border border-black p-0.5 text-center"></td>
                              <td className="border border-black p-1 font-semibold italic text-slate-800 pl-4">{item.uraianSubKegiatan || item.uraian}</td>
                              <td className="border border-black p-1 text-right font-mono font-bold pr-1">{formatRupiah(item.anggaran)}</td>
                              <td className="border border-black p-0.5 text-center"></td>
                            </tr>

                            {/* BELANJA DETAIL ROW (RED/ROSE TEXT PERSIS GAMBAR USER WITH FULL-CELL COLOR) */}
                            <tr className="border-b border-black h-[22px]">
                              <td className="border border-black p-0.5 text-center font-mono text-rose-700 font-bold">{parts[0]}</td>
                              <td className="border border-black p-0.5 text-center font-mono text-rose-700 font-bold">{parts[1]}</td>
                              <td className="border border-black p-0.5 text-center font-mono text-rose-700 font-bold">{item.kodeRekeningKegiatan}</td>
                              <td className="border border-black p-0.5 text-center font-mono text-rose-700 font-bold">{jParts[0]}</td>
                              <td className="border border-black p-0.5 text-center font-mono text-rose-700 font-bold">{jParts[1]}</td>
                              <td className="border border-black p-1 font-semibold text-rose-700 italic pl-6">{item.uraian}</td>
                              <td className="border border-black p-1 text-right font-mono text-rose-700 font-bold pr-1">{formatRupiah(item.anggaran)}</td>
                              {renderSumberDanaTd(item.sumberDana)}
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* JUMLAH BELANJA TOTAL */}
          <tr className="bg-[#8bc34a] font-black border-b border-black text-[9.5pt] text-black">
            <td className="border border-black p-0.5" colSpan={5}></td>
            <td className="border border-black p-1 uppercase font-black">JUMLAH BELANJA</td>
            <td className="border border-black p-1 text-right font-mono font-black pr-1">{formatRupiah(totalBelanja)}</td>
            <td className="border border-black p-0.5"></td>
          </tr>

          {/* SURPLUS / (DEFISIT) */}
          <tr className="bg-slate-100 font-extrabold border-b border-black">
            <td className="border border-black p-0.5" colSpan={5}></td>
            <td className="border border-black p-1 uppercase font-black">SURPLUS /(DEFISIT)</td>
            <td className="border border-black p-1 text-right font-mono font-black pr-1">{formatRupiah(surplusDefisit)}</td>
            <td className="border border-black p-0.5"></td>
          </tr>
        </tbody>
      </table>

      {/* TANDA TANGAN KEPALA DESA */}
      <div className="flex justify-end text-[9.5pt] font-serif mt-10">
        <div className="text-center w-[220px]">
          <div>Kepala Desa, Cimanggu I</div>
          <div className="h-[60px]"></div>
          <div className="font-extrabold underline uppercase">HERNAWAN M. SODIK</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CSS PRINT RULES FOR EXACT F4 PORTRAIT CAMBRIA FORMAT */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media screen {
          #apbdes-print-portal {
            display: none !important;
          }
        }
        @media print {
          body > *:not(#apbdes-print-portal) {
            display: none !important;
          }

          #apbdes-print-portal {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 215.9mm !important;
            min-height: 330.2mm !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            font-family: Cambria, "Times New Roman", Times, serif !important;
          }

          #apbdes-print-portal * {
            visibility: visible !important;
            color: #000000 !important;
          }

          #apbdes-print-portal table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #apbdes-print-portal tr {
            display: table-row !important;
          }

          #apbdes-print-portal td, #apbdes-print-portal th {
            display: table-cell !important;
            border-color: #000000 !important;
          }

          @page {
            size: 215.9mm 330.2mm; /* F4 Portrait */
            margin: 10mm 12mm;
          }
        }
      `}} />

      {/* STATS & SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
        <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pendapatan Desa</span>
            <div className="p-2 rounded-xl bg-slate-800 text-amber-400">
              <Coins size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalPendapatan)}</div>
          <span className="text-[11px] text-slate-400 mt-2 block">Transfer DD, ADD, BHPRD, BANKEU</span>
        </div>

        <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Total Belanja APBDes</span>
            <div className="p-2 rounded-xl bg-emerald-500/40 text-white">
              <Banknote size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(totalBelanja)}</div>
          <span className="text-[11px] text-emerald-100 mt-2 block">Belanja 5 Bidang Pemdes 2026</span>
        </div>

        <div className={`rounded-3xl p-5 text-white shadow-xl relative overflow-hidden ${surplusDefisit >= 0 ? "bg-teal-600" : "bg-rose-600"}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Status Balance APBDes</span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono">Rp {formatRupiah(surplusDefisit)}</div>
          <span className="text-[11px] text-white/80 mt-2 block">{surplusDefisit >= 0 ? "Surplus Anggaran Terjaga" : "Defisit Anggaran"}</span>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
            1
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Konsolidasi APBDes 2026 (Peraturan Desa Cimanggu I No 6 Thn 2025)</h3>
            <p className="text-[11px] text-slate-500">Master Konsolidasi Belanja 5 Bidang Pemdes & Pendapatan Transfer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTempPendapatan(pendapatanList);
              setIsEditingPagu(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <Edit3 size={15} />
            <span>Edit Pagu Pendapatan</span>
          </button>

          <button
            onClick={() => setIsAddBelanjaModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Tambah Item Belanja APBDes</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[44px]"
          >
            <Printer size={16} />
            <span>Cetak APBDes (F4 Portrait)</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER ON SCREEN */}
      <div className="bg-slate-200 p-4 rounded-2xl no-print overflow-x-auto">
        <span className="block text-center text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
          --- Preview Dokumen Resmi APBDes (Kertas F4 Cambria - Persis Gambar Lampiran User) ---
        </span>

        {renderApbdesDocument(false)}
      </div>

      {/* MODAL EDIT PAGU PENDAPATAN MANUAL */}
      {isEditingPagu && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Coins size={18} className="text-amber-500" />
                <span>Edit Pagu Pendapatan Desa 2026</span>
              </h3>
              <button onClick={() => setIsEditingPagu(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 text-xs sm:text-sm">
              {tempPendapatan.map((item, idx) => (
                <div key={item.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <label className="block font-bold text-slate-800">{item.kode} - {item.nama}</label>
                  <input
                    type="number"
                    value={item.paguAnggaran || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const updated = [...tempPendapatan];
                      updated[idx].paguAnggaran = val;
                      setTempPendapatan(updated);
                    }}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingPagu(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePaguManual}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
              >
                <Save size={14} /> Simpan Pagu Pendapatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM TAMBAH ITEM BELANJA APBDES BERDASARKAN BIDANG */}
      {isAddBelanjaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                <span>Tambah Item Belanja APBDes Menurut Bidang</span>
              </h3>
              <button onClick={() => setIsAddBelanjaModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBelanjaItem} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bidang APBDes</label>
                  <select
                    value={newBidangCode}
                    onChange={(e) => setNewBidangCode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1">1. Penyelenggaraan Pemdes</option>
                    <option value="2">2. Pembangunan Desa</option>
                    <option value="3">3. Pembinaan Kemasyarakatan</option>
                    <option value="4">4. Pemberdayaan Masyarakat</option>
                    <option value="5">5. Penanggulangan Bencana/BLT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub-Bidang Kode (a b)</label>
                  <input
                    type="text"
                    value={newSubBidangCode}
                    onChange={(e) => setNewSubBidangCode(e.target.value)}
                    placeholder="1 1 / 2 3"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Sub-Bidang</label>
                <input
                  type="text"
                  value={newSubBidangName}
                  onChange={(e) => setNewSubBidangName(e.target.value)}
                  placeholder="Penyelenggaraan Belanja Penghasilan Tetap, Tunjangan dan Operasional Pemdes"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Kegiatan (c)</label>
                  <input
                    type="text"
                    value={newKodeRekeningKegiatan}
                    onChange={(e) => setNewKodeRekeningKegiatan(e.target.value)}
                    placeholder="01 / 02 / 13"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Belanja (b)</label>
                  <select
                    value={newJenisBelanjaKode}
                    onChange={(e) => setNewJenisBelanjaKode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="5 1">5 1 (Belanja Pegawai)</option>
                    <option value="5 2">5 2 (Belanja Barang & Jasa)</option>
                    <option value="5 3">5 3 (Belanja Modal)</option>
                    <option value="5 4">5 4 (Belanja Tak Terduga)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Sub-Kegiatan</label>
                <input
                  type="text"
                  value={newUraianSubKegiatan}
                  onChange={(e) => setNewUraianSubKegiatan(e.target.value)}
                  placeholder="Contoh: Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Anggaran Biaya (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newAnggaran || ""}
                    onChange={(e) => setNewAnggaran(Number(e.target.value))}
                    placeholder="50000000"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-extrabold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sumber Dana</label>
                  <input
                    type="text"
                    value={newSumberDana}
                    onChange={(e) => setNewSumberDana(e.target.value)}
                    placeholder="ADD, PBH / DD / PBK"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBelanjaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <Plus size={14} /> Simpan Ke APBDes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REACT PORTAL DIRECT TO BODY FOR 100% RELIABLE PRINTING */}
      {mounted && createPortal(
        renderApbdesDocument(true),
        document.body
      )}
    </div>
  );
}
