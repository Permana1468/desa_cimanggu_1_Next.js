"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, defaultData: T): T {
  ensureDirectoryExists();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultData;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDirectoryExists();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/* =========================================================================
   MANAJEMEN INVENTARISASI & ASET DESA CIMANGGU I (PERMENDAGRI 1/2016)
   ========================================================================= */

export type BidangAset = 
  | "BARANG_KANTOR"               // Peralatan & Mesin (Komputer, Kendaraan, Meja, Kursi, dsb)
  | "GEDUNG_BANGUNAN"             // Gedung Kantor Desa, Balai Desa, Poskesdes, PAUD
  | "PEMBANGUNAN_INFRASTRUKTUR"   // Jalan Desa, Drainase, Jembatan, TPT, Irigasi
  | "TANAH_DESA"                  // Tanah Kas Desa, Bengkok, Lapangan, TPU
  | "ASET_LAINNYA";               // Software, Buku Perpustakaan, dsb.

export type KondisiAset = "BAIK" | "KURANG_BAIK" | "RUSAK_BERAT";

export interface AsetDesaItem {
  id: string;
  kodeRegister: string;            // e.g. AST-BRG/CMG1-2026/001
  namaBarang: string;
  bidang: BidangAset;
  bidangLabel: string;
  kategori: string;
  merekTipe: string;
  nomorRangkaSeri?: string;
  volume: number;
  satuan: string;
  tahunPengadaan: number;
  sumberDana: string;
  nilaiPerolehan: number;          // Dalam Rupiah
  kondisi: KondisiAset;
  lokasi: string;
  penanggungJawab: string;
  keterangan?: string;
  qrData?: string;
  createdAt: string;
  updatedAt: string;
}

const initialAsetList: AsetDesaItem[] = [
  {
    id: "AST-2026-001",
    kodeRegister: "AST-BRG/CMG1-2026/001",
    namaBarang: "PC All-in-One Loket Pelayanan Publik",
    bidang: "BARANG_KANTOR",
    bidangLabel: "Peralatan & Mesin (Barang Kantor)",
    kategori: "Elektronik & IT",
    merekTipe: "HP ProOne 240 G10 Core i5",
    nomorRangkaSeri: "SN: HP-CMG-2026-001",
    volume: 1,
    satuan: "Unit",
    tahunPengadaan: 2026,
    sumberDana: "APBDes - Dana Desa (DDS)",
    nilaiPerolehan: 14500000,
    kondisi: "BAIK",
    lokasi: "Loket 1 Pelayanan Desa Cimanggu I",
    penanggungJawab: "Kasi Pelayanan",
    keterangan: "Digunakan untuk operasional persuratan dan antrean warga.",
    qrData: "CMG1-AST:AST-BRG/CMG1-2026/001|HP ProOne 240 G10|Kasi Pelayanan|2026",
    createdAt: new Date("2026-01-15").toISOString(),
    updatedAt: new Date("2026-01-15").toISOString(),
  },
  {
    id: "AST-2026-002",
    kodeRegister: "AST-BRG/CMG1-2026/002",
    namaBarang: "Laptop Operasional Administrasi Kaur TU",
    bidang: "BARANG_KANTOR",
    bidangLabel: "Peralatan & Mesin (Barang Kantor)",
    kategori: "Elektronik & IT",
    merekTipe: "ASUS ExpertBook B1402CGA Core i7",
    nomorRangkaSeri: "SN: ASUS-CMG-2026-088",
    volume: 1,
    satuan: "Unit",
    tahunPengadaan: 2026,
    sumberDana: "Alokasi Dana Desa (ADD)",
    nilaiPerolehan: 11800000,
    kondisi: "BAIK",
    lokasi: "Ruang Tata Usaha & Umum",
    penanggungJawab: "Kaur TU & Umum",
    keterangan: "Digunakan untuk buku agenda surat dan inventaris desa.",
    qrData: "CMG1-AST:AST-BRG/CMG1-2026/002|ASUS ExpertBook|Kaur TU|2026",
    createdAt: new Date("2026-02-10").toISOString(),
    updatedAt: new Date("2026-02-10").toISOString(),
  },
  {
    id: "AST-2026-003",
    kodeRegister: "AST-BRG/CMG1-2026/003",
    namaBarang: "Printer Epson L3210 All-in-One",
    bidang: "BARANG_KANTOR",
    bidangLabel: "Peralatan & Mesin (Barang Kantor)",
    kategori: "Elektronik & IT",
    merekTipe: "Epson EcoTank L3210",
    nomorRangkaSeri: "SN: EPS-9921-CMG",
    volume: 1,
    satuan: "Unit",
    tahunPengadaan: 2026,
    sumberDana: "Alokasi Dana Desa (ADD)",
    nilaiPerolehan: 3250000,
    kondisi: "BAIK",
    lokasi: "Ruang Pelayanan",
    penanggungJawab: "Kasi Pelayanan",
    keterangan: "Printer cetak surat dinas dan SKKM/SKU warga.",
    qrData: "CMG1-AST:AST-BRG/CMG1-2026/003|Epson L3210|Kasi Pelayanan|2026",
    createdAt: new Date("2026-02-15").toISOString(),
    updatedAt: new Date("2026-02-15").toISOString(),
  },
  {
    id: "AST-2026-004",
    kodeRegister: "AST-GDG/CMG1-2018/001",
    namaBarang: "Gedung Kantor Pemerintah Desa Cimanggu I",
    bidang: "GEDUNG_BANGUNAN",
    bidangLabel: "Gedung & Bangunan",
    kategori: "Gedung Pemerintahan",
    merekTipe: "Bangunan Permanen 2 Lantai",
    nomorRangkaSeri: "IMB: 640/2018-Cmg",
    volume: 380,
    satuan: "M2",
    tahunPengadaan: 2018,
    sumberDana: "APBDes & Bantuan Pemkab Bogor",
    nilaiPerolehan: 450000000,
    kondisi: "BAIK",
    lokasi: "Jl. Raya Gardu Seri Kp. Ciaruteun RT.004 RW.008",
    penanggungJawab: "Kaur TU & Umum",
    keterangan: "Kantor induk pemerintahan desa, balai warga, dan loket pelayanan.",
    qrData: "CMG1-AST:AST-GDG/CMG1-2018/001|Kantor Desa Cimanggu I|Kaur TU|2018",
    createdAt: new Date("2018-08-17").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString(),
  },
  {
    id: "AST-2026-005",
    kodeRegister: "AST-INF/CMG1-2026/001",
    namaBarang: "Betonisasi Jalan Lingkungan Kp. Ciaruteun",
    bidang: "PEMBANGUNAN_INFRASTRUKTUR",
    bidangLabel: "Pembangunan & Infrastruktur Desa",
    kategori: "Jalan Lingkungan",
    merekTipe: "Beton K-250 (P: 350m, L: 2.5m, T: 0.15m)",
    volume: 350,
    satuan: "Meter",
    tahunPengadaan: 2026,
    sumberDana: "APBDes - Dana Desa Tahap I 2026",
    nilaiPerolehan: 85000000,
    kondisi: "BAIK",
    lokasi: "Kp. Ciaruteun RT 004 / RW 008",
    penanggungJawab: "TPK Desa & Kaur Perencanaan",
    keterangan: "Jalan poros penghubung pemukiman warga ke jalan desa.",
    qrData: "CMG1-AST:AST-INF/CMG1-2026/001|Betonisasi Jalan Ciaruteun|TPK Desa|2026",
    createdAt: new Date("2026-04-10").toISOString(),
    updatedAt: new Date("2026-04-10").toISOString(),
  },
  {
    id: "AST-2026-006",
    kodeRegister: "AST-TNH/CMG1-2015/001",
    namaBarang: "Tanah Kas Desa Lapangan Sepak Bola Cimanggu I",
    bidang: "TANAH_DESA",
    bidangLabel: "Tanah Kas Desa",
    kategori: "Tanah Fasilitas Olahraga / Umum",
    merekTipe: "Sertifikat Hak Pakai Pemdes Cimanggu I",
    nomorRangkaSeri: "No. Sertifikat: 10.02.04.01.4.00192",
    volume: 4500,
    satuan: "M2",
    tahunPengadaan: 2015,
    sumberDana: "Aset Asli Desa (PADes)",
    nilaiPerolehan: 1350000000,
    kondisi: "BAIK",
    lokasi: "Dusun II Kp. Gardu Seri Desa Cimanggu I",
    penanggungJawab: "Kepala Desa Cimanggu I",
    keterangan: "Tanah kas desa untuk fasilitas kegiatan olahraga dan pemuda.",
    qrData: "CMG1-AST:AST-TNH/CMG1-2015/001|Tanah Lapangan Olahraga|Kades|2015",
    createdAt: new Date("2015-05-20").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString(),
  }
];

export async function getAsetDesaList(params?: {
  bidang?: string;
  search?: string;
  kondisi?: string;
}): Promise<{ success: boolean; data: AsetDesaItem[] }> {
  try {
    const list = readJsonFile<AsetDesaItem[]>("aset_desa_inventaris.json", initialAsetList);
    let filtered = [...list];

    if (params?.bidang && params.bidang !== "ALL") {
      filtered = filtered.filter((item) => item.bidang === params.bidang);
    }

    if (params?.kondisi && params.kondisi !== "ALL") {
      filtered = filtered.filter((item) => item.kondisi === params.kondisi);
    }

    if (params?.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.namaBarang.toLowerCase().includes(q) ||
          item.kodeRegister.toLowerCase().includes(q) ||
          item.lokasi.toLowerCase().includes(q) ||
          item.penanggungJawab.toLowerCase().includes(q) ||
          item.merekTipe.toLowerCase().includes(q)
      );
    }

    return { success: true, data: filtered };
  } catch (error: any) {
    console.error("Error getAsetDesaList:", error);
    return { success: false, data: [] };
  }
}

export async function createAsetDesa(data: {
  namaBarang: string;
  bidang: BidangAset;
  kategori: string;
  merekTipe: string;
  nomorRangkaSeri?: string;
  volume: number;
  satuan: string;
  tahunPengadaan: number;
  sumberDana: string;
  nilaiPerolehan: number;
  kondisi: KondisiAset;
  lokasi: string;
  penanggungJawab: string;
  keterangan?: string;
}): Promise<{ success: boolean; item?: AsetDesaItem; error?: string }> {
  try {
    const list = readJsonFile<AsetDesaItem[]>("aset_desa_inventaris.json", initialAsetList);
    
    // Tentukan Prefix berdasarkan Bidang
    let prefix = "AST-BRG";
    let bidangLabel = "Peralatan & Mesin (Barang Kantor)";
    if (data.bidang === "GEDUNG_BANGUNAN") {
      prefix = "AST-GDG";
      bidangLabel = "Gedung & Bangunan";
    } else if (data.bidang === "PEMBANGUNAN_INFRASTRUKTUR") {
      prefix = "AST-INF";
      bidangLabel = "Pembangunan & Infrastruktur Desa";
    } else if (data.bidang === "TANAH_DESA") {
      prefix = "AST-TNH";
      bidangLabel = "Tanah Kas Desa";
    } else if (data.bidang === "ASET_LAINNYA") {
      prefix = "AST-LAIN";
      bidangLabel = "Aset Tak Berwujud & Lainnya";
    }

    const year = data.tahunPengadaan || new Date().getFullYear();
    const countBidang = list.filter((i) => i.bidang === data.bidang).length + 1;
    const seqStr = String(countBidang).padStart(3, "0");
    const kodeRegister = `${prefix}/CMG1-${year}/${seqStr}`;

    const now = new Date().toISOString();
    const qrData = `CMG1-AST:${kodeRegister}|${data.namaBarang}|${data.penanggungJawab}|${year}`;

    const newItem: AsetDesaItem = {
      id: `AST-${Date.now()}`,
      kodeRegister,
      namaBarang: data.namaBarang,
      bidang: data.bidang,
      bidangLabel,
      kategori: data.kategori || "Umum",
      merekTipe: data.merekTipe || "-",
      nomorRangkaSeri: data.nomorRangkaSeri,
      volume: Number(data.volume) || 1,
      satuan: data.satuan || "Unit",
      tahunPengadaan: Number(year),
      sumberDana: data.sumberDana || "APBDes",
      nilaiPerolehan: Number(data.nilaiPerolehan) || 0,
      kondisi: data.kondisi || "BAIK",
      lokasi: data.lokasi || "Kantor Desa Cimanggu I",
      penanggungJawab: data.penanggungJawab || "Kaur TU & Umum",
      keterangan: data.keterangan || "",
      qrData,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newItem);
    writeJsonFile("aset_desa_inventaris.json", list);

    revalidatePath("/dashboard/aset");
    revalidatePath("/dashboard");
    return { success: true, item: newItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mencatat aset baru" };
  }
}

export async function deleteAsetDesa(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const list = readJsonFile<AsetDesaItem[]>("aset_desa_inventaris.json", initialAsetList);
    const filtered = list.filter((item) => item.id !== id);
    writeJsonFile("aset_desa_inventaris.json", filtered);
    revalidatePath("/dashboard/aset");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus aset" };
  }
}

export async function getAsetSummaryStats(): Promise<{
  totalValuasiRp: number;
  totalItem: number;
  totalBaik: number;
  totalKurangBaik: number;
  totalRusak: number;
  byBidang: {
    barangKantor: number;
    gedung: number;
    infrastruktur: number;
    tanah: number;
    lainnya: number;
  };
}> {
  const list = readJsonFile<AsetDesaItem[]>("aset_desa_inventaris.json", initialAsetList);
  
  const totalValuasiRp = list.reduce((acc, item) => acc + (Number(item.nilaiPerolehan) || 0), 0);
  const totalBaik = list.filter((i) => i.kondisi === "BAIK").length;
  const totalKurangBaik = list.filter((i) => i.kondisi === "KURANG_BAIK").length;
  const totalRusak = list.filter((i) => i.kondisi === "RUSAK_BERAT").length;

  return {
    totalValuasiRp,
    totalItem: list.length,
    totalBaik,
    totalKurangBaik,
    totalRusak,
    byBidang: {
      barangKantor: list.filter((i) => i.bidang === "BARANG_KANTOR").length,
      gedung: list.filter((i) => i.bidang === "GEDUNG_BANGUNAN").length,
      infrastruktur: list.filter((i) => i.bidang === "PEMBANGUNAN_INFRASTRUKTUR").length,
      tanah: list.filter((i) => i.bidang === "TANAH_DESA").length,
      lainnya: list.filter((i) => i.bidang === "ASET_LAINNYA").length,
    },
  };
}
