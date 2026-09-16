// Master Parameter Kode Rekening SiskeuDes (Kabupaten Bogor)
// Termasuk: 
// 1. Parameter Kode Rekening APBDes (Struktur Akun 1-7)
// 2. Parameter Bidang & Kegiatan SiskeuDes
// 3. Parameter Kode Output Kegiatan
// 4. Parameter Sumber Dana (PAD, ADD, DDS, PBH, PBK, PBP, SWD, DLL)
// 5. Tabel Korolari Belanja Modal ke Aktiva Tetap

export interface KodeRekeningItem {
  id: string;
  kodeBidang: string;
  namaBidang: string;
  kodeSubBidang: string;
  namaSubBidang: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  kodeOutput: string;
  uraianOutput: string;
  satuanOutput: string;
  isCustom?: boolean;
}

export interface KodeKegiatanItem {
  id: string;
  kodeBidang: string;
  namaBidang: string;
  kodeSubBidang: string;
  namaSubBidang: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  isCustom?: boolean;
}

export interface SumberDanaItem {
  id: string;
  no: number;
  kode: string;
  nama: string;
  keterangan?: string;
  isCustom?: boolean;
}

export interface RekeningApbdesItem {
  id: string;
  kode: string;
  uraian: string;
  kategoriAkun: "1. ASET" | "2. KEWAJIBAN" | "3. EKUITAS" | "4. PENDAPATAN" | "5. BELANJA" | "6. PEMBIAYAAN" | "7. NON ANGGARAN";
  level: number;
  isCustom?: boolean;
}

export interface KorolariItem {
  id: string;
  kodeBelanjaModal: string;
  namaBelanjaModal: string;
  kodeDebet: string;
  namaDebet: string;
  kodeKredit: string;
  namaKredit: string;
  isCustom?: boolean;
}

// =========================================================================
// 1. DAFTAR PARAMETER SUMBERDANA (KABUPATEN BOGOR)
// =========================================================================
export const INITIAL_SUMBER_DANA_LIST: SumberDanaItem[] = [
  { id: "sd-1", no: 1, kode: "PAD", nama: "Pendapatan Asli Desa", keterangan: "Hasil Usaha, Hasil Aset, Swadaya, dll" },
  { id: "sd-2", no: 2, kode: "ADD", nama: "Alokasi Dana Desa", keterangan: "Alokasi Dana Desa dari APBD Kabupaten" },
  { id: "sd-3", no: 3, kode: "DDS", nama: "Dana Desa (Dropping APBN)", keterangan: "Dana Desa Sumber APBN Kemendes/Kemenkeu" },
  { id: "sd-4", no: 4, kode: "PBH", nama: "Pen. Bagi Hasil Pajak Retribusi Daerah", keterangan: "Bagi Hasil Pajak & Retribusi Daerah Kabupaten" },
  { id: "sd-5", no: 5, kode: "PBK", nama: "Pen. Bantuan Keuangan Kab/Kota", keterangan: "Bantuan Keuangan Kabupaten (e.g. SAMISADE)" },
  { id: "sd-6", no: 6, kode: "PBP", nama: "Pen. Bantuan Keuangan Provinsi", keterangan: "Bantuan Keuangan Pemerintah Provinsi Jawa Barat" },
  { id: "sd-7", no: 7, kode: "SWD", nama: "Swadaya Masyarakat", keterangan: "Sumbangan & Partisipasi Swadaya Masyarakat" },
  { id: "sd-8", no: 8, kode: "DLL", nama: "Pendapatan Lain Lain", keterangan: "Bunga Bank, Hibah & Penerimaan Sah Lainnya" }
];

// =========================================================================
// 2. TABEL PARAMETER KOROLARI BELANJA MODAL KE AKTIVA TETAP
// =========================================================================
export const INITIAL_KOROLARI_LIST: KorolariItem[] = [
  { id: "kor-1", kodeBelanjaModal: "5.3.1.01", namaBelanjaModal: "Belanja Modal Pembebasan/Pembelian Tanah", kodeDebet: "1.3.1.01", namaDebet: "Tanah Kas Desa", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-2", kodeBelanjaModal: "5.3.1.02", namaBelanjaModal: "Belanja Modal Pembayaran Honorarium Tim Tanah", kodeDebet: "1.3.1.01", namaDebet: "Tanah Kas Desa", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-3", kodeBelanjaModal: "5.3.1.03", namaBelanjaModal: "Belanja Modal Pengukuran dan Pembuatan Sertifikat Tanah", kodeDebet: "1.3.1.01", namaDebet: "Tanah Kas Desa", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-4", kodeBelanjaModal: "5.3.1.04", namaBelanjaModal: "Belanja Modal Pengurukan dan Pematangan Tanah", kodeDebet: "1.3.1.01", namaDebet: "Tanah Kas Desa", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-5", kodeBelanjaModal: "5.3.1.05", namaBelanjaModal: "Belanja Modal Perjalanan Pengadaan Tanah", kodeDebet: "1.3.1.01", namaDebet: "Tanah Kas Desa", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-6", kodeBelanjaModal: "5.3.1.99", namaBelanjaModal: "Belanja Modal Pengadaan Tanah Lainnya", kodeDebet: "1.3.1.01", namaDebet: "Tanah Kas Desa", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-7", kodeBelanjaModal: "5.3.2.01", namaBelanjaModal: "Belanja Modal Pembayaran Honor Tim Pelaksana Kegiatan (PM)", kodeDebet: "1.3.2.11", namaDebet: "Peralatan dan Mesin Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-8", kodeBelanjaModal: "5.3.2.02", namaBelanjaModal: "Belanja Modal Peralatan Elektronik dan Alat Studio", kodeDebet: "1.3.2.06", namaDebet: "Alat Studio, Komunikasi dan Pemancar", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-9", kodeBelanjaModal: "5.3.2.03", namaBelanjaModal: "Belanja Modal Peralatan Komputer", kodeDebet: "1.3.2.07", namaDebet: "Komputer", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-10", kodeBelanjaModal: "5.3.2.04", namaBelanjaModal: "Belanja Modal Peralatan Mebelair dan Aksesoris Ruangan", kodeDebet: "1.3.2.05", namaDebet: "Alat Kantor dan Rumah Tangga", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-11", kodeBelanjaModal: "5.3.2.05", namaBelanjaModal: "Belanja Modal Peralatan Dapur", kodeDebet: "1.3.2.05", namaDebet: "Alat Kantor dan Rumah Tangga", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-12", kodeBelanjaModal: "5.3.2.06", namaBelanjaModal: "Belanja Modal Peralatan Alat Ukur", kodeDebet: "1.3.2.03", namaDebet: "Alat Bengkel dan Alat Ukur", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-13", kodeBelanjaModal: "5.3.2.07", namaBelanjaModal: "Belanja Modal Peralatan Rambu-rambu/Patok Tanah", kodeDebet: "1.3.2.11", namaDebet: "Peralatan dan Mesin Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-14", kodeBelanjaModal: "5.3.2.08", namaBelanjaModal: "Belanja Modal Peralatan Khusus Kesehatan", kodeDebet: "1.3.2.11", namaDebet: "Peralatan dan Mesin Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-15", kodeBelanjaModal: "5.3.2.09", namaBelanjaModal: "Belanja Modal Peralatan Khusus Pertanian/Peternakan/Perikanan", kodeDebet: "1.3.2.04", namaDebet: "Alat Pertanian dan Perikanan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-16", kodeBelanjaModal: "5.3.2.10", namaBelanjaModal: "Belanja Modal Mesin", kodeDebet: "1.3.2.11", namaDebet: "Peralatan dan Mesin Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-17", kodeBelanjaModal: "5.3.2.11", namaBelanjaModal: "Belanja Modal Pengadaan Alat-alat Berat", kodeDebet: "1.3.2.01", namaDebet: "Alat Besar", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-18", kodeBelanjaModal: "5.3.2.99", namaBelanjaModal: "Belanja Modal Peralatan, Mesin dan Alat Berat Lainnya", kodeDebet: "1.3.2.01", namaDebet: "Alat Besar", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-19", kodeBelanjaModal: "5.3.3.01", namaBelanjaModal: "Belanja Modal Honor Tim Pengadaan (Kendaraan)", kodeDebet: "1.3.2.02", namaDebet: "Alat Angkutan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-20", kodeBelanjaModal: "5.3.3.02", namaBelanjaModal: "Belanja Modal Kendaraan Darat Bermotor", kodeDebet: "1.3.2.02", namaDebet: "Alat Angkutan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-21", kodeBelanjaModal: "5.3.3.03", namaBelanjaModal: "Belanja Modal Kendaaran Darat Tidak Bermotor", kodeDebet: "1.3.2.02", namaDebet: "Alat Angkutan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-22", kodeBelanjaModal: "5.3.3.04", namaBelanjaModal: "Belanja Modal Kendaraan Air Bermotor", kodeDebet: "1.3.2.02", namaDebet: "Alat Angkutan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-23", kodeBelanjaModal: "5.3.3.05", namaBelanjaModal: "Belanja Modal Kendaraan Air Tidak Bermotor", kodeDebet: "1.3.2.02", namaDebet: "Alat Angkutan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-24", kodeBelanjaModal: "5.3.3.99", namaBelanjaModal: "Belanja Modal Kendaraan Lainnya", kodeDebet: "1.3.2.02", namaDebet: "Alat Angkutan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-25", kodeBelanjaModal: "5.3.4.01", namaBelanjaModal: "Belanja Modal Gedung, Bangunan, Taman - Honor Pelaksana Kegiatan", kodeDebet: "1.3.3.25", namaDebet: "Bangunan Gedung Tempat Kerja Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-26", kodeBelanjaModal: "5.3.4.02", namaBelanjaModal: "Belanja Modal Gedung, Bangunan, Taman - Upah Tenaga Kerja", kodeDebet: "1.3.3.25", namaDebet: "Bangunan Gedung Tempat Kerja Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-27", kodeBelanjaModal: "5.3.4.03", namaBelanjaModal: "Belanja Modal Gedung, Bangunan, Taman - Bahan Baku/Material", kodeDebet: "1.3.3.25", namaDebet: "Bangunan Gedung Tempat Kerja Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-28", kodeBelanjaModal: "5.3.4.04", namaBelanjaModal: "Belanja Modal Gedung, Bangunan, Taman - Sewa Peralatan", kodeDebet: "1.3.3.25", namaDebet: "Bangunan Gedung Tempat Kerja Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-29", kodeBelanjaModal: "5.3.4.05", namaBelanjaModal: "Belanja Modal Gedung, Bangunan, Taman - Administrasi Kegiatan", kodeDebet: "1.3.3.25", namaDebet: "Bangunan Gedung Tempat Kerja Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-30", kodeBelanjaModal: "5.3.5.01", namaBelanjaModal: "Belanja Modal Jalan - Honor Tim Pelaksana Kegiatan", kodeDebet: "1.3.4.01", namaDebet: "Jalan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-31", kodeBelanjaModal: "5.3.5.02", namaBelanjaModal: "Belanja Modal Jalan - Upah Tenaga Kerja", kodeDebet: "1.3.4.01", namaDebet: "Jalan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-32", kodeBelanjaModal: "5.3.5.03", namaBelanjaModal: "Belanja Modal Jalan - Bahan Baku/Material", kodeDebet: "1.3.4.01", namaDebet: "Jalan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-33", kodeBelanjaModal: "5.3.5.04", namaBelanjaModal: "Belanja Modal Jalan - Sewa Peralatan", kodeDebet: "1.3.4.01", namaDebet: "Jalan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-34", kodeBelanjaModal: "5.3.5.05", namaBelanjaModal: "Belanja Modal Jalan - Administrasi Kegiatan", kodeDebet: "1.3.4.01", namaDebet: "Jalan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-35", kodeBelanjaModal: "5.3.6.01", namaBelanjaModal: "Belanja Modal Jembatan - Honor Pelaksana Kegiatan", kodeDebet: "1.3.4.02", namaDebet: "Jembatan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-36", kodeBelanjaModal: "5.3.6.02", namaBelanjaModal: "Belanja Modal Jembatan - Upah Tenaga Kerja", kodeDebet: "1.3.4.02", namaDebet: "Jembatan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-37", kodeBelanjaModal: "5.3.6.03", namaBelanjaModal: "Belanja Modal Jembatan - Bahan Baku/Material", kodeDebet: "1.3.4.02", namaDebet: "Jembatan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-38", kodeBelanjaModal: "5.3.6.04", namaBelanjaModal: "Belanja Modal Jembatan - Sewa Peralatan", kodeDebet: "1.3.4.02", namaDebet: "Jembatan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-39", kodeBelanjaModal: "5.3.6.05", namaBelanjaModal: "Belanja Modal Jembatan - Administrasi Kegiatan", kodeDebet: "1.3.4.02", namaDebet: "Jembatan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-40", kodeBelanjaModal: "5.3.7.01", namaBelanjaModal: "Belanja Modal Irigasi/Embung/Drainase/dll - Honor Tim Pelaksana", kodeDebet: "1.3.4.03", namaDebet: "Bangunan Air Irigasi", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-41", kodeBelanjaModal: "5.3.7.02", namaBelanjaModal: "Belanja Modal Irigasi/Embung/Drainase/dll - Upah Tenaga Kerja", kodeDebet: "1.3.4.03", namaDebet: "Bangunan Air Irigasi", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-42", kodeBelanjaModal: "5.3.7.03", namaBelanjaModal: "Belanja Modal Irigasi/Embung/Drainase/dll - Bahan Baku/Material", kodeDebet: "1.3.4.03", namaDebet: "Bangunan Air Irigasi", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-43", kodeBelanjaModal: "5.3.7.04", namaBelanjaModal: "Belanja Modal Irigasi/Embung/Drainase/dll - Sewa Peralatan", kodeDebet: "1.3.4.03", namaDebet: "Bangunan Air Irigasi", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-44", kodeBelanjaModal: "5.3.7.05", namaBelanjaModal: "Belanja Modal Irigasi/Embung/Drainase/dll - Administrasi Kegiatan", kodeDebet: "1.3.4.03", namaDebet: "Bangunan Air Irigasi", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-45", kodeBelanjaModal: "5.3.8.01", namaBelanjaModal: "Belanja Modal Jaringan/Instalasi - Honor Tim Pelaksana Kegiatan", kodeDebet: "1.3.4.16", namaDebet: "Instalasi Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-46", kodeBelanjaModal: "5.3.8.02", namaBelanjaModal: "Belanja Modal Jaringan/Instalasi - Upah Tenaga Kerja", kodeDebet: "1.3.4.16", namaDebet: "Instalasi Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-47", kodeBelanjaModal: "5.3.8.03", namaBelanjaModal: "Belanja Modal Jaringan/Instalasi - Bahan Baku/Material", kodeDebet: "1.3.4.16", namaDebet: "Instalasi Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-48", kodeBelanjaModal: "5.3.8.04", namaBelanjaModal: "Belanja Modal Jaringan/Instalasi - Sewa Peralatan", kodeDebet: "1.3.4.16", namaDebet: "Instalasi Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-49", kodeBelanjaModal: "5.3.8.05", namaBelanjaModal: "Belanja Modal Jaringan/Instalasi - Administrasi Kegiatan", kodeDebet: "1.3.4.16", namaDebet: "Instalasi Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-50", kodeBelanjaModal: "5.3.9.01", namaBelanjaModal: "Belanja Khusus Pendidikan dan Perpustakaan", kodeDebet: "1.3.5.01", namaDebet: "Bahan Perpustakaan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-51", kodeBelanjaModal: "5.3.9.02", namaBelanjaModal: "Belanja Khusus Olahraga", kodeDebet: "1.3.5.02", namaDebet: "Barang Bercorak Seni, Kebudayaan dan Olahraga", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-52", kodeBelanjaModal: "5.3.9.03", namaBelanjaModal: "Belanja Modal Khusus Kesenian/Kebudayaan/Keagamaan", kodeDebet: "1.3.2.11", namaDebet: "Peralatan dan Mesin Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-53", kodeBelanjaModal: "5.3.9.04", namaBelanjaModal: "Belanja Modal Tumbuhan/Tanaman", kodeDebet: "1.3.5.05", namaDebet: "Tanaman", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-54", kodeBelanjaModal: "5.3.9.05", namaBelanjaModal: "Belanja Modal Hewan", kodeDebet: "1.3.5.03", namaDebet: "Hewan dan Ternak", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-55", kodeBelanjaModal: "5.3.9.99", namaBelanjaModal: "Belanja Modal Lainnya", kodeDebet: "1.5.5.03", namaDebet: "Aset Lain-lain Lainnya", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-56", kodeBelanjaModal: "6.2.1.01", namaBelanjaModal: "Pembentukan Dana Cadangan", kodeDebet: "1.4.1.01", namaDebet: "Dana Cadangan", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" },
  { id: "kor-57", kodeBelanjaModal: "6.2.2.01", namaBelanjaModal: "Penyertaan Modal Desa", kodeDebet: "1.2.1.01", namaDebet: "Penyertaan Modal Pemerintah Desa", kodeKredit: "3.1.1.01", namaKredit: "Ekuitas" }
];

// =========================================================================
// 3. DAFTAR PARAMETER REKENING APBDESA (AKUN 1 - 7)
// =========================================================================
export const INITIAL_REKENING_APBDES_LIST: RekeningApbdesItem[] = [
  // --- 1. ASET ---
  { id: "rek-1", kode: "1.", uraian: "ASET", kategoriAkun: "1. ASET", level: 1 },
  { id: "rek-1.1", kode: "1.1.", uraian: "Aset Lancar", kategoriAkun: "1. ASET", level: 2 },
  { id: "rek-1.1.1", kode: "1.1.1.", uraian: "Kas dan Bank", kategoriAkun: "1. ASET", level: 3 },
  { id: "rek-1.1.1.01", kode: "1.1.1.01.", uraian: "Kas di Bendahara Desa", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.1.1.02", kode: "1.1.1.02.", uraian: "Rekening Kas Desa", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.1.2", kode: "1.1.2.", uraian: "Piutang", kategoriAkun: "1. ASET", level: 3 },
  { id: "rek-1.1.2.01", kode: "1.1.2.01.", uraian: "Piutang Sewa Tanah", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.1.2.02", kode: "1.1.2.02.", uraian: "Piutang Sewa Gedung", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.1.3", kode: "1.1.3.", uraian: "Persediaan", kategoriAkun: "1. ASET", level: 3 },
  { id: "rek-1.1.3.01", kode: "1.1.3.01.", uraian: "Persediaan Benda Pos dan Materai", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.1.3.02", kode: "1.1.3.02.", uraian: "Persediaan Alat Tulis Kantor", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.1.3.03", kode: "1.1.3.03.", uraian: "Persediaan Blangko dan Barang Cetakan", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.1.3.04", kode: "1.1.3.04.", uraian: "Persediaan Alat-Alat Listrik/Lampu/Batterai", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.1.3.05", kode: "1.1.3.05.", uraian: "Persediaan Bahan/Material", kategoriAkun: "1. ASET", level: 4 },

  { id: "rek-1.2", kode: "1.2.", uraian: "Investasi", kategoriAkun: "1. ASET", level: 2 },
  { id: "rek-1.2.1.01", kode: "1.2.1.01.", uraian: "Penyertaan Modal Pemerintah Desa", kategoriAkun: "1. ASET", level: 4 },

  { id: "rek-1.3", kode: "1.3.", uraian: "Aset Tetap", kategoriAkun: "1. ASET", level: 2 },
  { id: "rek-1.3.1.01", kode: "1.3.1.01.", uraian: "Tanah Kas Desa", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.3.2.01", kode: "1.3.2.01.", uraian: "Alat Besar", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.3.2.02", kode: "1.3.2.02.", uraian: "Alat Angkutan", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.3.2.05", kode: "1.3.2.05.", uraian: "Alat Kantor dan Rumah Tangga", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.3.2.07", kode: "1.3.2.07.", uraian: "Komputer", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.3.3.01", kode: "1.3.3.01.", uraian: "Bangunan Gedung Kantor", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.3.4.01", kode: "1.3.4.01.", uraian: "Jalan", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.3.4.02", kode: "1.3.4.02.", uraian: "Jembatan", kategoriAkun: "1. ASET", level: 4 },
  { id: "rek-1.3.4.03", kode: "1.3.4.03.", uraian: "Bangunan Air Irigasi", kategoriAkun: "1. ASET", level: 4 },

  // --- 2. KEWAJIBAN ---
  { id: "rek-2", kode: "2.", uraian: "KEWAJIBAN", kategoriAkun: "2. KEWAJIBAN", level: 1 },
  { id: "rek-2.1", kode: "2.1.", uraian: "Kewajiban Jangka Pendek", kategoriAkun: "2. KEWAJIBAN", level: 2 },
  { id: "rek-2.1.1.01", kode: "2.1.1.01.", uraian: "Hutang Jaminan Pelaksanaan Pekerjaan", kategoriAkun: "2. KEWAJIBAN", level: 4 },
  { id: "rek-2.1.3.01", kode: "2.1.3.01.", uraian: "Hutang Pajak Pertambahan Nilai (PPN)", kategoriAkun: "2. KEWAJIBAN", level: 4 },
  { id: "rek-2.1.3.02", kode: "2.1.3.02.", uraian: "Hutang Pajak Penghasilan PPh 21", kategoriAkun: "2. KEWAJIBAN", level: 4 },
  { id: "rek-2.1.3.03", kode: "2.1.3.03.", uraian: "Hutang Pajak Penghasilan PPh 22", kategoriAkun: "2. KEWAJIBAN", level: 4 },

  // --- 3. EKUITAS ---
  { id: "rek-3", kode: "3.", uraian: "EKUITAS", kategoriAkun: "3. EKUITAS", level: 1 },
  { id: "rek-3.1.1.01", kode: "3.1.1.01.", uraian: "Ekuitas", kategoriAkun: "3. EKUITAS", level: 4 },
  { id: "rek-3.1.2.01", kode: "3.1.2.01.", uraian: "Ekuitas SAL", kategoriAkun: "3. EKUITAS", level: 4 },

  // --- 4. PENDAPATAN ---
  { id: "rek-4", kode: "4.", uraian: "PENDAPATAN", kategoriAkun: "4. PENDAPATAN", level: 1 },
  { id: "rek-4.1", kode: "4.1.", uraian: "Pendapatan Asli Desa (PADes)", kategoriAkun: "4. PENDAPATAN", level: 2 },
  { id: "rek-4.1.1.01", kode: "4.1.1.01.", uraian: "Bagi Hasil BUMDes", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.1.2.01", kode: "4.1.2.01.", uraian: "Pengelolaan Tanah Kas Desa", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.1.2.03", kode: "4.1.2.03.", uraian: "Pasar Desa", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.1.3.01", kode: "4.1.3.01.", uraian: "Hasil Swadaya, Partisipasi dan Gotong Royong", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.2", kode: "4.2.", uraian: "Pendapatan Transfer", kategoriAkun: "4. PENDAPATAN", level: 2 },
  { id: "rek-4.2.1.01", kode: "4.2.1.01.", uraian: "Dana Desa (DDS)", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.2.2.01", kode: "4.2.2.01.", uraian: "Bagi Hasil Pajak dan Retribusi Daerah Kabupaten (PBH)", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.2.3.01", kode: "4.2.3.01.", uraian: "Alokasi Dana Desa (ADD)", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.2.4.01", kode: "4.2.4.01.", uraian: "Bantuan Keuangan dari APBD Provinsi (PBP)", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.2.5.01", kode: "4.2.5.01.", uraian: "Bantuan Keuangan dari APBD Kabupaten (PBK)", kategoriAkun: "4. PENDAPATAN", level: 4 },
  { id: "rek-4.2.5.92", kode: "4.2.5.92.", uraian: "Bantuan Keuangan Infrastruktur Desa (SAMISADE)", kategoriAkun: "4. PENDAPATAN", level: 4 },

  // --- 5. BELANJA ---
  { id: "rek-5", kode: "5.", uraian: "BELANJA", kategoriAkun: "5. BELANJA", level: 1 },
  { id: "rek-5.1", kode: "5.1.", uraian: "Belanja Pegawai", kategoriAkun: "5. BELANJA", level: 2 },
  { id: "rek-5.1.1.01", kode: "5.1.1.01.", uraian: "Penghasilan Tetap Kepala Desa", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.1.1.02", kode: "5.1.1.02.", uraian: "Tunjangan Kepala Desa", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.1.2.01", kode: "5.1.2.01.", uraian: "Penghasilan Tetap Perangkat Desa", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.1.2.02", kode: "5.1.2.02.", uraian: "Tunjangan Perangkat Desa", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.1.4.01", kode: "5.1.4.01.", uraian: "Tunjangan Kedudukan BPD", kategoriAkun: "5. BELANJA", level: 4 },
  
  { id: "rek-5.2", kode: "5.2.", uraian: "Belanja Barang dan Jasa", kategoriAkun: "5. BELANJA", level: 2 },
  { id: "rek-5.2.1.01", kode: "5.2.1.01.", uraian: "Belanja Alat Tulis Kantor dan Benda Pos", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.2.1.05", kode: "5.2.1.05.", uraian: "Belanja Barang Cetak dan Penggandaan", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.2.1.06", kode: "5.2.1.06.", uraian: "Belanja Barang Konsumsi (Makan/Minum)", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.2.2.01", kode: "5.2.2.01.", uraian: "Belanja Jasa Honorarium Tim Pelaksana Kegiatan", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.2.3.01", kode: "5.2.3.01.", uraian: "Belanja Perjalanan Dinas Dalam Kabupaten/Kota", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.2.5.01", kode: "5.2.5.01.", uraian: "Belanja Jasa Langganan Listrik", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.2.5.08", kode: "5.2.5.08.", uraian: "Belanja Insentif/Operasional RT/RW", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.2.6.05", kode: "5.2.6.05.", uraian: "Belanja Pemeliharaan Jalan", kategoriAkun: "5. BELANJA", level: 4 },

  { id: "rek-5.3", kode: "5.3.", uraian: "Belanja Modal", kategoriAkun: "5. BELANJA", level: 2 },
  { id: "rek-5.3.1.01", kode: "5.3.1.01.", uraian: "Belanja Modal Pembebasan/Pembelian Tanah", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.3.2.03", kode: "5.3.2.03.", uraian: "Belanja Modal Peralatan Komputer", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.3.3.02", kode: "5.3.3.02.", uraian: "Belanja Modal Kendaraan Darat Bermotor", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.3.4.03", kode: "5.3.4.03.", uraian: "Belanja Modal Gedung, Bangunan, Taman - Bahan Baku/Material", kategoriAkun: "5. BELANJA", level: 4 },
  { id: "rek-5.3.5.03", kode: "5.3.5.03.", uraian: "Belanja Modal Jalan - Bahan Baku/Material", kategoriAkun: "5. BELANJA", level: 4 },

  { id: "rek-5.4", kode: "5.4.", uraian: "Belanja Tidak Terduga", kategoriAkun: "5. BELANJA", level: 2 },
  { id: "rek-5.4.1.01", kode: "5.4.1.01.", uraian: "Belanja Tidak Terduga", kategoriAkun: "5. BELANJA", level: 4 },

  // --- 6. PEMBIAYAAN ---
  { id: "rek-6", kode: "6.", uraian: "PEMBIAYAAN", kategoriAkun: "6. PEMBIAYAAN", level: 1 },
  { id: "rek-6.1", kode: "6.1.", uraian: "Penerimaan Pembiayaan", kategoriAkun: "6. PEMBIAYAAN", level: 2 },
  { id: "rek-6.1.1.01", kode: "6.1.1.01.", uraian: "SILPA Tahun Sebelumnya", kategoriAkun: "6. PEMBIAYAAN", level: 4 },
  { id: "rek-6.1.2.01", kode: "6.1.2.01.", uraian: "Pencairan Dana Cadangan", kategoriAkun: "6. PEMBIAYAAN", level: 4 },
  { id: "rek-6.2", kode: "6.2.", uraian: "Pengeluaran Pembiayaan", kategoriAkun: "6. PEMBIAYAAN", level: 2 },
  { id: "rek-6.2.1.01", kode: "6.2.1.01.", uraian: "Pembentukan Dana Cadangan", kategoriAkun: "6. PEMBIAYAAN", level: 4 },
  { id: "rek-6.2.2.01", kode: "6.2.2.01.", uraian: "Penyertaan Modal Desa", kategoriAkun: "6. PEMBIAYAAN", level: 4 },

  // --- 7. NON ANGGARAN ---
  { id: "rek-7", kode: "7.", uraian: "NON ANGGARAN", kategoriAkun: "7. NON ANGGARAN", level: 1 },
  { id: "rek-7.1", kode: "7.1.", uraian: "Perhitungan Fihak Ketiga (PFK)", kategoriAkun: "7. NON ANGGARAN", level: 2 },
  { id: "rek-7.1.1.01", kode: "7.1.1.01.", uraian: "Potongan Pajak PPN Pusat", kategoriAkun: "7. NON ANGGARAN", level: 4 },
  { id: "rek-7.1.1.02", kode: "7.1.1.02.", uraian: "Potongan Pajak PPh Pasal 21", kategoriAkun: "7. NON ANGGARAN", level: 4 },
  { id: "rek-7.1.1.03", kode: "7.1.1.03.", uraian: "Potongan Pajak PPh Pasal 22", kategoriAkun: "7. NON ANGGARAN", level: 4 },
  { id: "rek-7.1.1.04", kode: "7.1.1.04.", uraian: "Potongan Pajak PPh Pasal 23", kategoriAkun: "7. NON ANGGARAN", level: 4 }
];

// =========================================================================
// 4. DAFTAR PARAMETER BIDANG DAN KEGIATAN SISKEUDES (KABUPATEN BOGOR)
// =========================================================================
export const INITIAL_KODE_KEGIATAN_LIST: KodeKegiatanItem[] = [
  { id: "keg-01.01.01", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.01", namaKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa" },
  { id: "keg-01.01.02", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.02", namaKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Perangkat Desa" },
  { id: "keg-01.01.03", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.03", namaKegiatan: "Penyediaan Jaminan Sosial bagi Kepala Desa dan Perangkat Desa" },
  { id: "keg-01.01.04", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.04", namaKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)" },
  { id: "keg-01.01.05", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.05", namaKegiatan: "Penyediaan Tunjangan BPD" },
  { id: "keg-01.01.06", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.06", namaKegiatan: "Penyediaan Operasional BPD (rapat, ATK, Makan Minum, Pakaian Seragam, Listrik dll)" },
  { id: "keg-01.01.07", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.07", namaKegiatan: "Penyediaan Insentif/Operasional RT/RW" },
  { id: "keg-01.01.08", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.08", namaKegiatan: "Penyediaan Operasional Pemerintah Desa yang bersumber dari Dana Desa" },
  { id: "keg-01.01.90", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.90", namaKegiatan: "Tunjangan Penghasilan Aparatur Pemerintah Desa (Banprov)" },
  { id: "keg-01.01.99", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.99", namaKegiatan: "Lain-lain Sub Bidang Siltap dan Operasional Pemerintahan Desa" },
  { id: "keg-01.02.01", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.02", namaSubBidang: "Penyediaan Sarana Prasarana Pemerintahan Desa", kodeKegiatan: "01.02.01", namaKegiatan: "Penyediaan Sarana (Aset Tetap) Perkantoran/Pemerintahan" },
  { id: "keg-01.02.02", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.02", namaSubBidang: "Penyediaan Sarana Prasarana Pemerintahan Desa", kodeKegiatan: "01.02.02", namaKegiatan: "Pemeliharaan Gedung/Prasarana Kantor Desa" },
  { id: "keg-01.02.03", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.02", namaSubBidang: "Penyediaan Sarana Prasarana Pemerintahan Desa", kodeKegiatan: "01.02.03", namaKegiatan: "Pembangunan/Rehabilitasi/Peningkatan Gedung/Prasarana Kantor Desa" },
  { id: "keg-01.03.01", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.03", namaSubBidang: "Pengelolaan Administrasi Kependudukan, Pencatatan Sipil, Statistik dan Kearsipan", kodeKegiatan: "01.03.01", namaKegiatan: "Pelayanan Administrasi Umum dan Kependudukan" },
  { id: "keg-01.04.01", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.04", namaSubBidang: "Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeKegiatan: "01.04.01", namaKegiatan: "Penyelenggaraan Musyawarah Perencanaan Desa/Pembahasan APBDes (Reguler)" },
  { id: "keg-01.04.03", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.04", namaSubBidang: "Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeKegiatan: "01.04.03", namaKegiatan: "Penyusunan Dokumen Perencanaan Desa (RPJMDesa/RKPDesa dll)" },
  { id: "keg-01.04.04", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.04", namaSubBidang: "Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan", kodeKegiatan: "01.04.04", namaKegiatan: "Penyusunan Dokumen Keuangan Desa (APBDes, APBDes Perubahan, LPJ dll)" },
  { id: "keg-02.01.01", kodeBidang: "02", namaBidang: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", kodeSubBidang: "02.01", namaSubBidang: "Sub Bidang Pendidikan", kodeKegiatan: "02.01.01", namaKegiatan: "Penyelenggaraan PAUD/TK/TPA/TKA/TPQ/Madrasah Non-Formal Milik Desa" },
  { id: "keg-02.02.01", kodeBidang: "02", namaBidang: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", kodeSubBidang: "02.02", namaSubBidang: "Sub Bidang Kesehatan", kodeKegiatan: "02.02.01", namaKegiatan: "Penyelenggaraan Pos Kesehatan Desa/Polindes Milik Desa" },
  { id: "keg-02.03.01", kodeBidang: "02", namaBidang: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", kodeSubBidang: "02.03", namaSubBidang: "Sub Bidang Pekerjaan Umum dan Penataan Ruang", kodeKegiatan: "02.03.01", namaKegiatan: "Pemeliharaan Jalan Desa" },
  { id: "keg-02.03.10", kodeBidang: "02", namaBidang: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", kodeSubBidang: "02.03", namaSubBidang: "Sub Bidang Pekerjaan Umum dan Penataan Ruang", kodeKegiatan: "02.03.10", namaKegiatan: "Pembangunan/Rehabilitas/Peningkatan/Pengerasan Jalan Desa" },
  { id: "keg-02.04.01", kodeBidang: "02", namaBidang: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", kodeSubBidang: "02.04", namaSubBidang: "Sub Bidang Kawasan Pemukiman", kodeKegiatan: "02.04.01", namaKegiatan: "Dukungan Pelaksanaan Program Pembangunan/Rehab Rumah Tidak Layak Huni GAKIN" },
  { id: "keg-03.01.90", kodeBidang: "03", namaBidang: "BIDANG PEMBINAAN KEMASYARAKATAN", kodeSubBidang: "03.01", namaSubBidang: "Sub Bidang Ketenteraman, Ketertiban Umum dan Perlindungan Masyarakat", kodeKegiatan: "03.01.90", namaKegiatan: "Penyediaan Insentif/Operasional Linmas" },
  { id: "keg-04.01.01", kodeBidang: "04", namaBidang: "BIDANG PEMBERDAYAAN MASYARAKAT", kodeSubBidang: "04.01", namaSubBidang: "Sub Bidang Kelautan dan Perikanan", kodeKegiatan: "04.01.01", namaKegiatan: "Pemeliharaan Karamba/Kolam Perikanan Darat Milik Desa" },
  { id: "keg-05.01.00", kodeBidang: "05", namaBidang: "BIDANG PENANGGULANGAN BENCANA, DARURAT DAN MENDESAK DESA", kodeSubBidang: "05.01", namaSubBidang: "Sub Bidang Penanggulangan Bencana", kodeKegiatan: "05.01.00", namaKegiatan: "Kegiatan Penanggulangan Bencana" },
  { id: "keg-05.03.00", kodeBidang: "05", namaBidang: "BIDANG PENANGGULANGAN BENCANA, DARURAT DAN MENDESAK DESA", kodeSubBidang: "05.03", namaSubBidang: "Sub Bidang Keadaan Mendesak", kodeKegiatan: "05.03.00", namaKegiatan: "Penanganan Keadaan Mendesak" }
];

// =========================================================================
// 5. DAFTAR PARAMETER KODE OUTPUT KEGIATAN KABUPATEN BOGOR
// =========================================================================
export const INITIAL_KODE_REKENING_LIST: KodeRekeningItem[] = [
  { id: "kr-110101", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.01", namaKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa", kodeOutput: "110101", uraianOutput: "Penghasilan Tetap Kepala Desa", satuanOutput: "OB (Orang/Bulan)" },
  { id: "kr-110102", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.01", namaKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa", kodeOutput: "110102", uraianOutput: "Tunjangan Kepala Desa", satuanOutput: "OB (Orang/Bulan)" },
  { id: "kr-110201", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.02", namaKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Perangkat Desa", kodeOutput: "110201", uraianOutput: "Penghasilan Tetap Perangkat Desa", satuanOutput: "OB (Orang/Bulan)" },
  { id: "kr-110202", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.02", namaKegiatan: "Penyediaan Penghasilan Tetap dan Tunjangan Perangkat Desa", kodeOutput: "110202", uraianOutput: "Tunjangan Perangkat Desa", satuanOutput: "OB (Orang/Bulan)" },
  { id: "kr-110401", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.04", namaKegiatan: "Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)", kodeOutput: "110401", uraianOutput: "Operasional Pemerintah Desa", satuanOutput: "Paket" },
  { id: "kr-110501", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.05", namaKegiatan: "Penyediaan Tunjangan BPD", kodeOutput: "110501", uraianOutput: "Tunjangan BPD", satuanOutput: "OB (Orang/Bulan)" },
  { id: "kr-110701", kodeBidang: "01", namaBidang: "BIDANG PENYELENGGARAN PEMERINTAHAN DESA", kodeSubBidang: "01.01", namaSubBidang: "Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa", kodeKegiatan: "01.01.07", namaKegiatan: "Penyediaan Insentif/Operasional RT/RW", kodeOutput: "110701", uraianOutput: "Operasional RT/RW", satuanOutput: "Paket" },
  { id: "kr-231001", kodeBidang: "02", namaBidang: "BIDANG PELAKSANAAN PEMBANGUNAN DESA", kodeSubBidang: "02.03", namaSubBidang: "Sub Bidang Pekerjaan Umum dan Penataan Ruang", kodeKegiatan: "02.03.10", namaKegiatan: "Pembangunan/Rehabilitas/Peningkatan/Pengerasan Jalan Desa", kodeOutput: "231001", uraianOutput: "Jalan Desa", satuanOutput: "Meter (M)" },
  { id: "kr-530001", kodeBidang: "05", namaBidang: "BIDANG PENANGGULANGAN BENCANA, DARURAT DAN MENDESAK DESA", kodeSubBidang: "05.03", namaSubBidang: "Sub Bidang Keadaan Mendesak", kodeKegiatan: "05.03.00", namaKegiatan: "Penanganan Keadaan Mendesak", kodeOutput: "530001", uraianOutput: "Bantuan Langsung Tunai (BLT)", satuanOutput: "KK" }
];

// Storage Keys
const LOCAL_STORAGE_KEY_OUTPUT = "desa_cimanggu_kode_rekening_list_v1";
const LOCAL_STORAGE_KEY_KEGIATAN = "desa_cimanggu_kode_kegiatan_list_v1";
const LOCAL_STORAGE_KEY_SUMBER_DANA = "desa_cimanggu_sumber_dana_list_v1";
const LOCAL_STORAGE_KEY_KOROLARI = "desa_cimanggu_korolari_list_v1";
const LOCAL_STORAGE_KEY_REKENING_APBDES = "desa_cimanggu_rekening_apbdes_list_v1";

// 1. Kode Output
export function getSavedKodeRekeningList(): KodeRekeningItem[] {
  if (typeof window === "undefined") return INITIAL_KODE_REKENING_LIST;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_OUTPUT);
    if (!raw) return INITIAL_KODE_REKENING_LIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_KODE_REKENING_LIST;
  } catch (err) {
    console.error("Failed to parse saved kode output", err);
    return INITIAL_KODE_REKENING_LIST;
  }
}

export function saveKodeRekeningList(items: KodeRekeningItem[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCAL_STORAGE_KEY_OUTPUT, JSON.stringify(items)); } catch (err) { console.error(err); }
}

export function resetKodeRekeningListToDefault(): KodeRekeningItem[] {
  if (typeof window === "undefined") return INITIAL_KODE_REKENING_LIST;
  try { localStorage.removeItem(LOCAL_STORAGE_KEY_OUTPUT); } catch (err) { console.error(err); }
  return INITIAL_KODE_REKENING_LIST;
}

// 2. Kode Kegiatan
export function getSavedKodeKegiatanList(): KodeKegiatanItem[] {
  if (typeof window === "undefined") return INITIAL_KODE_KEGIATAN_LIST;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_KEGIATAN);
    if (!raw) return INITIAL_KODE_KEGIATAN_LIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_KODE_KEGIATAN_LIST;
  } catch (err) {
    console.error("Failed to parse saved kode kegiatan", err);
    return INITIAL_KODE_KEGIATAN_LIST;
  }
}

export function saveKodeKegiatanList(items: KodeKegiatanItem[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCAL_STORAGE_KEY_KEGIATAN, JSON.stringify(items)); } catch (err) { console.error(err); }
}

export function resetKodeKegiatanListToDefault(): KodeKegiatanItem[] {
  if (typeof window === "undefined") return INITIAL_KODE_KEGIATAN_LIST;
  try { localStorage.removeItem(LOCAL_STORAGE_KEY_KEGIATAN); } catch (err) { console.error(err); }
  return INITIAL_KODE_KEGIATAN_LIST;
}

// 3. Sumber Dana
export function getSavedSumberDanaList(): SumberDanaItem[] {
  if (typeof window === "undefined") return INITIAL_SUMBER_DANA_LIST;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SUMBER_DANA);
    if (!raw) return INITIAL_SUMBER_DANA_LIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUMBER_DANA_LIST;
  } catch (err) {
    console.error("Failed to parse saved sumber dana", err);
    return INITIAL_SUMBER_DANA_LIST;
  }
}

export function saveSumberDanaList(items: SumberDanaItem[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCAL_STORAGE_KEY_SUMBER_DANA, JSON.stringify(items)); } catch (err) { console.error(err); }
}

export function resetSumberDanaListToDefault(): SumberDanaItem[] {
  if (typeof window === "undefined") return INITIAL_SUMBER_DANA_LIST;
  try { localStorage.removeItem(LOCAL_STORAGE_KEY_SUMBER_DANA); } catch (err) { console.error(err); }
  return INITIAL_SUMBER_DANA_LIST;
}

// 4. Korolari Belanja Modal
export function getSavedKorolariList(): KorolariItem[] {
  if (typeof window === "undefined") return INITIAL_KOROLARI_LIST;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_KOROLARI);
    if (!raw) return INITIAL_KOROLARI_LIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_KOROLARI_LIST;
  } catch (err) {
    console.error("Failed to parse saved korolari", err);
    return INITIAL_KOROLARI_LIST;
  }
}

export function saveKorolariList(items: KorolariItem[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCAL_STORAGE_KEY_KOROLARI, JSON.stringify(items)); } catch (err) { console.error(err); }
}

export function resetKorolariListToDefault(): KorolariItem[] {
  if (typeof window === "undefined") return INITIAL_KOROLARI_LIST;
  try { localStorage.removeItem(LOCAL_STORAGE_KEY_KOROLARI); } catch (err) { console.error(err); }
  return INITIAL_KOROLARI_LIST;
}

// 5. Rekening APBDes (Struktur Akun 1-7)
export function getSavedRekeningApbdesList(): RekeningApbdesItem[] {
  if (typeof window === "undefined") return INITIAL_REKENING_APBDES_LIST;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_REKENING_APBDES);
    if (!raw) return INITIAL_REKENING_APBDES_LIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REKENING_APBDES_LIST;
  } catch (err) {
    console.error("Failed to parse saved rekening apbdes", err);
    return INITIAL_REKENING_APBDES_LIST;
  }
}

export function saveRekeningApbdesList(items: RekeningApbdesItem[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LOCAL_STORAGE_KEY_REKENING_APBDES, JSON.stringify(items)); } catch (err) { console.error(err); }
}

export function resetRekeningApbdesListToDefault(): RekeningApbdesItem[] {
  if (typeof window === "undefined") return INITIAL_REKENING_APBDES_LIST;
  try { localStorage.removeItem(LOCAL_STORAGE_KEY_REKENING_APBDES); } catch (err) { console.error(err); }
  return INITIAL_REKENING_APBDES_LIST;
}
