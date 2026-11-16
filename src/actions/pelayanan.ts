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
   1. ANTREAN LOKET TERPADU
   ========================================================================= */

export type QueueItem = {
  id: string; // e.g. "A001"
  nama: string;
  nik?: string;
  nomorHp?: string;
  loketKode: "1" | "2" | "3";
  loketNama: string;
  service: string;
  status: "waiting" | "processing" | "completed";
  type: "Online" | "Offline";
  time: string; // e.g. "09:15 WIB"
  createdAt: string;
  updatedAt: string;
};

const initialQueues: QueueItem[] = [
  {
    id: "A001",
    nama: "Budi Santoso",
    nik: "3201012345670001",
    nomorHp: "081234567801",
    loketKode: "1",
    loketNama: "Loket 1: Persuratan & SKTM",
    service: "Pembuatan SKU",
    status: "processing",
    type: "Offline",
    time: "09:15 WIB",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "B008",
    nama: "Siti Aminah",
    nik: "3201012345670002",
    nomorHp: "081234567802",
    loketKode: "2",
    loketNama: "Loket 2: KTP & Kependudukan",
    service: "Mutasi Masuk & Pengurusan KTP",
    status: "waiting",
    type: "Online",
    time: "09:30 WIB",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "C003",
    nama: "Ahmad Dahlan",
    nik: "3201012345670003",
    nomorHp: "081234567803",
    loketKode: "3",
    loketNama: "Loket 3: Konsultasi & Bansos",
    service: "Konsultasi Bansos DTKS",
    status: "waiting",
    type: "Offline",
    time: "09:45 WIB",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "A002",
    nama: "Hendra Wijaya",
    nik: "3201012345670004",
    nomorHp: "081234567804",
    loketKode: "1",
    loketNama: "Loket 1: Persuratan & SKTM",
    service: "Surat Kematian & Akta",
    status: "waiting",
    type: "Offline",
    time: "10:00 WIB",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "B007",
    nama: "Rina Kusuma",
    nik: "3201012345670005",
    nomorHp: "081234567805",
    loketKode: "2",
    loketNama: "Loket 2: KTP & Kependudukan",
    service: "Keterangan Domisili",
    status: "completed",
    type: "Online",
    time: "09:00 WIB",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
];

export async function getPelayananQueues(): Promise<{
  success: boolean;
  queues: QueueItem[];
  activeTicket: QueueItem | null;
  stats: {
    total: number;
    online: number;
    offline: number;
    waiting: number;
    processing: number;
    completed: number;
  };
}> {
  const queues = readJsonFile<QueueItem[]>("pelayanan_antrian.json", initialQueues);
  const activeTicket = queues.find((q) => q.status === "processing") || queues.find((q) => q.status === "waiting") || null;

  const stats = {
    total: queues.length,
    online: queues.filter((q) => q.type === "Online").length,
    offline: queues.filter((q) => q.type === "Offline").length,
    waiting: queues.filter((q) => q.status === "waiting").length,
    processing: queues.filter((q) => q.status === "processing").length,
    completed: queues.filter((q) => q.status === "completed").length,
  };

  return { success: true, queues, activeTicket, stats };
}

export async function createPelayananQueue(data: {
  nama: string;
  nik?: string;
  nomorHp?: string;
  loketKode: "1" | "2" | "3";
  service: string;
  type: "Online" | "Offline";
}): Promise<{ success: boolean; item?: QueueItem; error?: string }> {
  try {
    const queues = readJsonFile<QueueItem[]>("pelayanan_antrian.json", initialQueues);
    const prefix = data.loketKode === "1" ? "A" : data.loketKode === "2" ? "B" : "C";

    const regex = new RegExp(`^${prefix}(\\d+)$`);
    let maxNum = 0;
    for (const q of queues) {
      const match = q.id.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    const nextId = `${prefix}${String(maxNum + 1).padStart(3, "0")}`;

    const loketNamaMap = {
      "1": "Loket 1: Persuratan & SKTM",
      "2": "Loket 2: KTP & Kependudukan",
      "3": "Loket 3: Konsultasi & Bansos",
    };

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

    const newItem: QueueItem = {
      id: nextId,
      nama: data.nama.trim(),
      nik: data.nik?.trim() || "",
      nomorHp: data.nomorHp?.trim() || "",
      loketKode: data.loketKode,
      loketNama: loketNamaMap[data.loketKode],
      service: data.service,
      status: "waiting",
      type: data.type,
      time: timeStr,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    queues.unshift(newItem);
    writeJsonFile("pelayanan_antrian.json", queues);
    revalidatePath("/dashboard");

    return { success: true, item: newItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal membuat nomor antrean" };
  }
}

export async function updateQueueStatus(
  id: string,
  newStatus: "waiting" | "processing" | "completed"
): Promise<{ success: boolean; error?: string }> {
  try {
    const queues = readJsonFile<QueueItem[]>("pelayanan_antrian.json", initialQueues);
    const idx = queues.findIndex((q) => q.id === id);
    if (idx === -1) return { success: false, error: "Antrean tidak ditemukan" };

    if (newStatus === "processing") {
      const targetLoket = queues[idx].loketKode;
      for (const q of queues) {
        if (q.id !== id && q.loketKode === targetLoket && q.status === "processing") {
          q.status = "completed";
          q.updatedAt = new Date().toISOString();
        }
      }
    }

    queues[idx].status = newStatus;
    queues[idx].updatedAt = new Date().toISOString();
    writeJsonFile("pelayanan_antrian.json", queues);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah status antrean" };
  }
}

export async function getPelayananLoketStatus(): Promise<{
  loket1: { serving: string | null; waitingCount: number; status: "Sibuk" | "Siap Panggil" };
  loket2: { serving: string | null; waitingCount: number; status: "Sibuk" | "Siap Panggil" };
  loket3: { serving: string | null; waitingCount: number; status: "Sibuk" | "Siap Panggil" };
}> {
  const queues = readJsonFile<QueueItem[]>("pelayanan_antrian.json", initialQueues);

  const getLoketInfo = (kode: "1" | "2" | "3") => {
    const inLoket = queues.filter((q) => q.loketKode === kode);
    const active = inLoket.find((q) => q.status === "processing");
    const nextWaiting = inLoket.find((q) => q.status === "waiting");
    const waitingCount = inLoket.filter((q) => q.status === "waiting").length;

    return {
      serving: active ? active.id : nextWaiting ? `Antrean: ${nextWaiting.id}` : null,
      waitingCount,
      status: (active ? "Sibuk" : "Siap Panggil") as "Sibuk" | "Siap Panggil",
    };
  };

  return {
    loket1: getLoketInfo("1"),
    loket2: getLoketInfo("2"),
    loket3: getLoketInfo("3"),
  };
}

/* =========================================================================
   2. PUSAT PERSURATAN & BUKU REGISTER TU
   ========================================================================= */

export type AgendaSuratItem = {
  id: string;
  tipe: "masuk" | "keluar";
  nomorSurat: string;
  nomorResi?: string;
  tanggal: string;
  pengirimAtauPenerima: string;
  perihal: string;
  keperluan?: string;
  status: "Draft" | "Diproses" | "Menunggu TTD Kades" | "Menunggu TTD Sekdes" | "Diterbitkan" | "Diterima" | "Selesai (Siap Diambil)";
  lokasiArsip?: string;
  penandatangan?: "KADES" | "SEKDES";
  penandatanganNama?: string;
  metodeTTD?: "TTD_BASAH" | "TTE";
  nomorRegisterSumber?: "OTOMATIS_TU" | "MANUAL_INPUT";
  catatanPengambilan?: string;
  createdAt: string;
};

const initialAgendaSurat: AgendaSuratItem[] = [
  {
    id: "SRT-IN-001",
    tipe: "masuk",
    nomorSurat: "470/120/Disdukcapil/XI/2026",
    tanggal: "14 Nov 2026",
    pengirimAtauPenerima: "Disdukcapil Kabupaten Bogor",
    perihal: "Percepatan Perekaman KTP-el Pemula & Pemadanan Data Kependudukan Semester II",
    status: "Diterima",
    lokasiArsip: "Bantex Masuk 2026 / Rak Pelayanan 01",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "SRT-OUT-001",
    tipe: "keluar",
    nomorSurat: "470/046/Pel-Cmg/XI/2026",
    nomorResi: "TRK-CMG-202611-001",
    tanggal: "15 Nov 2026",
    pengirimAtauPenerima: "Budi Santoso (RT 02 / RW 01)",
    perihal: "Surat Keterangan Usaha (SKU) - Usaha Warung Sembako Berkah",
    keperluan: "Kelengkapan pengajuan modal KUR BRI",
    status: "Selesai (Siap Diambil)",
    penandatangan: "KADES",
    penandatanganNama: "HERNAWAN M. SODIK (Kepala Desa Cimanggu I)",
    metodeTTD: "TTD_BASAH",
    nomorRegisterSumber: "OTOMATIS_TU",
    catatanPengambilan: "Surat telah ditandatangani manual oleh Kades dan dicap stempel basah. Silakan pemohon mengambil berkas fisik di Loket Pelayanan.",
    lokasiArsip: "Bantex Keluar SKU 2026 / Box 03",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
];

export async function getAgendaRegisterInfoTU(): Promise<{
  nextSeq: string;
  nextAutoNomor: string;
  totalSuratKeluar: number;
  totalSuratMasuk: number;
}> {
  const agenda = readJsonFile<AgendaSuratItem[]>("pelayanan_agenda_surat.json", initialAgendaSurat);
  const keluarList = agenda.filter((a) => a.tipe === "keluar");
  const countKeluar = keluarList.length + 1;
  const seqStr = String(countKeluar).padStart(3, "0");
  const nextAutoNomor = `470/${seqStr}/Pel-Cmg/XI/2026`;

  return {
    nextSeq: seqStr,
    nextAutoNomor,
    totalSuratKeluar: keluarList.length,
    totalSuratMasuk: agenda.filter((a) => a.tipe === "masuk").length,
  };
}

export async function getAgendaSuratList(
  type: "masuk" | "keluar",
  search?: string
): Promise<{ success: boolean; data: AgendaSuratItem[] }> {
  const agenda = readJsonFile<AgendaSuratItem[]>("pelayanan_agenda_surat.json", initialAgendaSurat);
  let filtered = agenda.filter((a) => a.tipe === type);

  if (search && search.trim() !== "") {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.nomorSurat.toLowerCase().includes(q) ||
        a.pengirimAtauPenerima.toLowerCase().includes(q) ||
        a.perihal.toLowerCase().includes(q) ||
        (a.nomorResi && a.nomorResi.toLowerCase().includes(q))
    );
  }

  return { success: true, data: filtered };
}

export async function createSuratPelayanan(data: {
  templateTitle: string;
  namaPemohon: string;
  nik: string;
  keperluan: string;
  isDraft?: boolean;
  penandatangan?: "KADES" | "SEKDES";
  modeNomor?: "OTOMATIS" | "MANUAL";
  manualNomorSurat?: string;
  catatanPengambilan?: string;
}): Promise<{
  success: boolean;
  item?: AgendaSuratItem;
  nomorSurat?: string;
  nomorResi?: string;
  error?: string;
}> {
  try {
    const agenda = readJsonFile<AgendaSuratItem[]>("pelayanan_agenda_surat.json", initialAgendaSurat);
    
    const countKeluar = agenda.filter((a) => a.tipe === "keluar").length + 1;
    const seqStr = String(countKeluar).padStart(3, "0");
    const nomorResi = `TRK-CMG-202611-${seqStr}`;

    // Tentukan nomor register surat: otomatis dari register TU atau manual
    let finalNomorSurat = `470/${seqStr}/Pel-Cmg/XI/2026`;
    if (data.modeNomor === "MANUAL" && data.manualNomorSurat && data.manualNomorSurat.trim() !== "") {
      finalNomorSurat = data.manualNomorSurat.trim();
    }

    const penandatanganRole = data.penandatangan || "KADES";
    const penandatanganNama =
      penandatanganRole === "SEKDES"
        ? "FAJAR TRI APRIANA (a.n. Kepala Desa Cimanggu I - Sekretaris Desa)"
        : "HERNAWAN M. SODIK (Kepala Desa Cimanggu I)";

    const now = new Date();
    const dateFormatted = `${now.getDate()} Nov 2026`;

    const newItem: AgendaSuratItem = {
      id: `SRT-OUT-${Date.now()}`,
      tipe: "keluar",
      nomorSurat: finalNomorSurat,
      nomorResi,
      tanggal: dateFormatted,
      pengirimAtauPenerima: `${data.namaPemohon} (NIK: ${data.nik || "-"})`,
      perihal: `${data.templateTitle} - ${data.keperluan.slice(0, 45)}`,
      keperluan: data.keperluan,
      status: data.isDraft
        ? "Draft"
        : penandatanganRole === "SEKDES"
        ? "Menunggu TTD Sekdes"
        : "Menunggu TTD Kades",
      penandatangan: penandatanganRole,
      penandatanganNama,
      metodeTTD: "TTD_BASAH",
      nomorRegisterSumber: data.modeNomor === "MANUAL" ? "MANUAL_INPUT" : "OTOMATIS_TU",
      catatanPengambilan:
        data.catatanPengambilan ||
        "Surat telah diregister di TU & dicetak. Sedang diajukan untuk TTD manual dan cap basah desa.",
      lokasiArsip: "Buku Register TU & Arsip Fisik Loket Pelayanan",
      createdAt: now.toISOString(),
    };

    agenda.unshift(newItem);
    writeJsonFile("pelayanan_agenda_surat.json", agenda);

    // Otomatis tercatat di tracking linimasa layanan
    await addDocumentTracking({
      resi: nomorResi,
      nomorSurat: finalNomorSurat,
      namaPemohon: data.namaPemohon,
      nik: data.nik,
      namaDokumen: data.templateTitle,
      penandatangan: penandatanganRole,
    });

    revalidatePath("/dashboard");
    return { success: true, item: newItem, nomorSurat: finalNomorSurat, nomorResi };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menerbitkan surat" };
  }
}

export async function createSuratMasukTU(data: {
  nomorSurat: string;
  tanggalSurat: string;
  pengirim: string;
  perihal: string;
  disposisiKades?: string;
  lokasiArsip?: string;
}): Promise<{ success: boolean; item?: AgendaSuratItem; error?: string }> {
  try {
    const agenda = readJsonFile<AgendaSuratItem[]>("pelayanan_agenda_surat.json", initialAgendaSurat);
    const now = new Date();
    const dateFormatted = `${now.getDate()} Nov 2026`;

    const newItem: AgendaSuratItem = {
      id: `SRT-IN-${Date.now()}`,
      tipe: "masuk",
      nomorSurat: data.nomorSurat,
      tanggal: data.tanggalSurat || dateFormatted,
      pengirimAtauPenerima: data.pengirim,
      perihal: data.perihal,
      status: "Diterima",
      lokasiArsip: data.lokasiArsip || "Bantex Surat Masuk 2026 / Rak TU",
      catatanPengambilan: data.disposisiKades ? `Disposisi: ${data.disposisiKades}` : undefined,
      createdAt: now.toISOString(),
    };

    agenda.unshift(newItem);
    writeJsonFile("pelayanan_agenda_surat.json", agenda);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/surat");
    return { success: true, item: newItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mencatat surat masuk" };
  }
}

/* =========================================================================
   3. TRACKING DOKUMEN & LINIMASA LAYANAN (DENGAN TTD MANUAL & CATATAN)
   ========================================================================= */

export type TrackingStep = {
  stepIndex: number;
  title: string;
  description: string;
  completedAt?: string | null;
  status: "completed" | "current" | "pending";
};

export type DocumentTrackingItem = {
  id: string; // e.g. TRK-CMG-202611-001
  resi: string;
  nomorSurat: string;
  namaPemohon: string;
  nik: string;
  namaDokumen: string;
  statusUtama: string;
  progressPercent: number;
  lastUpdated: string;
  penandatangan?: "KADES" | "SEKDES";
  catatanPetugas?: string;
  steps: TrackingStep[];
};

const initialTrackingList: DocumentTrackingItem[] = [
  {
    id: "TRK-CMG-202611-001",
    resi: "TRK-CMG-202611-001",
    nomorSurat: "470/046/Pel-Cmg/XI/2026",
    namaPemohon: "Budi Santoso",
    nik: "3201012345670001",
    namaDokumen: "Surat Keterangan Usaha (SKU)",
    statusUtama: "Selesai Diproses (Siap Diambil di Kantor Desa)",
    progressPercent: 100,
    lastUpdated: "Hari ini, 09:45 WIB",
    penandatangan: "KADES",
    catatanPetugas: "Surat telah ditandatangani manual oleh Kepala Desa & dicap stempel basah. Silakan pemohon mengambil berkas fisik di Loket Pelayanan Kantor Desa.",
    steps: [
      { stepIndex: 1, title: "Permohonan Masuk", description: "Warga mengajukan di Loket 1 Pelayanan", completedAt: "09:15 WIB", status: "completed" },
      { stepIndex: 2, title: "Verifikasi Berkas Fisik", description: "Kelengkapan berkas KTP & Pengantar RT terverifikasi", completedAt: "09:25 WIB", status: "completed" },
      { stepIndex: 3, title: "Paraf & Register Nomor TU", description: "Nomor terdaftar di Buku Register Kaur TU & diparaf Kasi", completedAt: "09:35 WIB", status: "completed" },
      { stepIndex: 4, title: "Tanda Tangan Manual & Cap Basah", description: "Telah ditandatangani fisik oleh Kades dan dibubuhi cap basah desa", completedAt: "09:40 WIB", status: "completed" },
      { stepIndex: 5, title: "Dokumen Fisik Siap Diambil", description: "Berkas asli siap diserahkan kepada pemohon di loket", completedAt: "09:45 WIB", status: "completed" },
    ],
  },
  {
    id: "TRK-CMG-202611-002",
    resi: "TRK-CMG-202611-002",
    nomorSurat: "474/012/Pel-Cmg/XI/2026",
    namaPemohon: "Siti Aminah",
    nik: "3201012345670002",
    namaDokumen: "Surat Pengantar Pindah Domisili",
    statusUtama: "Sedang Diproses (Pengajuan TTD Manual Sekdes)",
    progressPercent: 65,
    lastUpdated: "Hari ini, 10:10 WIB",
    penandatangan: "SEKDES",
    catatanPetugas: "Dokumen telah dicetak dan sedang diajukan ke meja Sekdes untuk penandatanganan manual dan cap basah.",
    steps: [
      { stepIndex: 1, title: "Permohonan Masuk", description: "Pengajuan terdaftar di sistem loket", completedAt: "09:30 WIB", status: "completed" },
      { stepIndex: 2, title: "Verifikasi Berkas Fisik", description: "Berkas fisik pengantar RT/RW valid", completedAt: "09:45 WIB", status: "completed" },
      { stepIndex: 3, title: "Paraf Kasi Pelayanan", description: "Pemeriksaan validasi kependudukan selesai", completedAt: "10:00 WIB", status: "completed" },
      { stepIndex: 4, title: "Tanda Tangan Manual & Cap Basah", description: "Sedang diajukan ke Sekdes (a.n. Kades)", completedAt: null, status: "current" },
      { stepIndex: 5, title: "Dokumen Fisik Siap Diambil", description: "Menunggu penyerahan di Loket Pelayanan", completedAt: null, status: "pending" },
    ],
  },
];

export async function getDocumentTrackingList(): Promise<{ success: boolean; data: DocumentTrackingItem[] }> {
  const list = readJsonFile<DocumentTrackingItem[]>("pelayanan_tracking.json", initialTrackingList);
  return { success: true, data: list };
}

export async function searchDocumentTracking(query: string): Promise<{ success: boolean; result: DocumentTrackingItem | null; message?: string }> {
  const cleanQ = query.trim().toUpperCase();
  if (!cleanQ) return { success: false, result: null, message: "Kueri pencarian kosong" };

  const list = readJsonFile<DocumentTrackingItem[]>("pelayanan_tracking.json", initialTrackingList);
  const found = list.find(
    (item) =>
      item.resi.toUpperCase().includes(cleanQ) ||
      item.nik.includes(cleanQ) ||
      item.namaPemohon.toUpperCase().includes(cleanQ) ||
      item.nomorSurat.toUpperCase().includes(cleanQ)
  );

  if (found) {
    return { success: true, result: found };
  }
  return { success: false, result: null, message: `Dokumen dengan nomor/NIK "${query}" tidak ditemukan.` };
}

export async function addDocumentTracking(params: {
  resi: string;
  nomorSurat: string;
  namaPemohon: string;
  nik: string;
  namaDokumen: string;
  penandatangan?: "KADES" | "SEKDES";
}): Promise<void> {
  const list = readJsonFile<DocumentTrackingItem[]>("pelayanan_tracking.json", initialTrackingList);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

  const pPenandatangan = params.penandatangan || "KADES";
  const penandatanganLabel = pPenandatangan === "SEKDES" ? "Sekdes (a.n. Kades)" : "Kades";

  const newTracking: DocumentTrackingItem = {
    id: params.resi,
    resi: params.resi,
    nomorSurat: params.nomorSurat,
    namaPemohon: params.namaPemohon,
    nik: params.nik,
    namaDokumen: params.namaDokumen,
    statusUtama: `Sedang Diproses (Pengajuan TTD Manual ${penandatanganLabel})`,
    progressPercent: 65,
    lastUpdated: `Hari ini, ${timeStr}`,
    penandatangan: pPenandatangan,
    catatanPetugas: `Surat telah dicetak dari sistem dan diregistrasikan ke Kaur TU. Sedang menunggu tanda tangan fisik oleh ${penandatanganLabel} dan cap stempel basah.`,
    steps: [
      { stepIndex: 1, title: "Permohonan Masuk", description: "Pengajuan tercatat di loket", completedAt: timeStr, status: "completed" },
      { stepIndex: 2, title: "Verifikasi Berkas Fisik", description: "Kelengkapan berkas fisik tervalidasi", completedAt: timeStr, status: "completed" },
      { stepIndex: 3, title: "Paraf & Register TU", description: "Nomor terdaftar di Buku Register Kaur TU", completedAt: timeStr, status: "completed" },
      { stepIndex: 4, title: "Tanda Tangan Manual & Cap Basah", description: `Sedang diajukan ke meja ${penandatanganLabel}`, completedAt: null, status: "current" },
      { stepIndex: 5, title: "Dokumen Fisik Siap Diambil", description: "Menunggu berkas siap di loket", completedAt: null, status: "pending" },
    ],
  };

  list.unshift(newTracking);
  writeJsonFile("pelayanan_tracking.json", list);
}

export async function updateDocumentTrackingStatus(params: {
  resi: string;
  action: "SEDANG_DIPROSES" | "SELESAI";
  catatan?: string;
}): Promise<{ success: boolean; item?: DocumentTrackingItem; error?: string }> {
  try {
    const list = readJsonFile<DocumentTrackingItem[]>("pelayanan_tracking.json", initialTrackingList);
    const idx = list.findIndex((item) => item.resi === params.resi);
    if (idx === -1) return { success: false, error: "Dokumen tidak ditemukan" };

    const doc = list[idx];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;
    const penandatanganLabel = doc.penandatangan === "SEKDES" ? "Sekdes" : "Kades";

    if (params.action === "SEDANG_DIPROSES") {
      doc.statusUtama = `Sedang Diproses (Pengajuan TTD Manual ${penandatanganLabel} & Cap Basah)`;
      doc.progressPercent = 70;
      doc.lastUpdated = `Hari ini, ${timeStr}`;
      doc.catatanPetugas =
        params.catatan ||
        `Dokumen sedang diajukan ke meja ${penandatanganLabel} untuk proses penandatanganan manual dan pembubuhan cap basah desa.`;
      
      // Update steps
      doc.steps[2].status = "completed";
      doc.steps[2].completedAt = timeStr;
      doc.steps[3].status = "current";
      doc.steps[4].status = "pending";
    } else if (params.action === "SELESAI") {
      doc.statusUtama = "Selesai Diproses (Siap Diambil di Kantor Desa)";
      doc.progressPercent = 100;
      doc.lastUpdated = `Hari ini, ${timeStr}`;
      doc.catatanPetugas =
        params.catatan ||
        "Surat telah ditandatangani manual dan dicap stempel basah. Silakan pemohon mengambil dokumen fisik asli di Loket Pelayanan Kantor Desa.";

      // Mark all steps completed
      doc.steps[2].status = "completed";
      doc.steps[2].completedAt = doc.steps[2].completedAt || timeStr;
      doc.steps[3].status = "completed";
      doc.steps[3].completedAt = timeStr;
      doc.steps[4].status = "completed";
      doc.steps[4].completedAt = timeStr;

      // Update in agenda surat as well
      const agenda = readJsonFile<AgendaSuratItem[]>("pelayanan_agenda_surat.json", initialAgendaSurat);
      const agendaIdx = agenda.findIndex((a) => a.nomorResi === params.resi || a.nomorSurat === doc.nomorSurat);
      if (agendaIdx !== -1) {
        agenda[agendaIdx].status = "Selesai (Siap Diambil)";
        agenda[agendaIdx].catatanPengambilan = doc.catatanPetugas;
        writeJsonFile("pelayanan_agenda_surat.json", agenda);
      }
    }

    list[idx] = doc;
    writeJsonFile("pelayanan_tracking.json", list);
    revalidatePath("/dashboard");

    return { success: true, item: doc };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui status tracking" };
  }
}

/* =========================================================================
   4. BUKU TAMU DIGITAL & LAYANAN UMUM
   ========================================================================= */

export type BukuTamuItem = {
  id: string;
  nama: string;
  instansi: string;
  keperluan: string;
  nomorHp: string;
  penerima: string;
  tanggal: string; // e.g. "15 Nov 2026"
  jam: string; // e.g. "09:15 WIB"
  createdAt: string;
};

const initialBukuTamu: BukuTamuItem[] = [
  {
    id: "GUEST-001",
    nama: "H. Asep Syaepudin, S.IP",
    instansi: "Kecamatan Cibungbulang (Kasi Trantib)",
    keperluan: "Koordinasi Penertiban Administrasi Kependudukan & Pengecekan Loket Pelayanan Terpadu",
    nomorHp: "0812-9876-5432",
    penerima: "Kasi Pelayanan Desa Cimanggu I",
    tanggal: "15 Nov 2026",
    jam: "09:15 WIB",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: "GUEST-002",
    nama: "Dra. Hj. Nurjanah",
    instansi: "Puskesmas Cibungbulang",
    keperluan: "Sinkronisasi data balita stunting & jadwal Posyandu Terpadu",
    nomorHp: "0813-1122-3344",
    penerima: "Kasi Pelayanan & Kader Posyandu",
    tanggal: "14 Nov 2026",
    jam: "11:30 WIB",
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
];

export async function getBukuTamuList(search?: string): Promise<{ success: boolean; data: BukuTamuItem[] }> {
  const list = readJsonFile<BukuTamuItem[]>("pelayanan_buku_tamu.json", initialBukuTamu);
  let filtered = list;

  if (search && search.trim() !== "") {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.nama.toLowerCase().includes(q) ||
        item.instansi.toLowerCase().includes(q) ||
        item.keperluan.toLowerCase().includes(q) ||
        item.penerima.toLowerCase().includes(q)
    );
  }

  return { success: true, data: filtered };
}

export async function createBukuTamu(data: {
  nama: string;
  instansi: string;
  keperluan: string;
  nomorHp: string;
  penerima?: string;
}): Promise<{ success: boolean; item?: BukuTamuItem; error?: string }> {
  try {
    const list = readJsonFile<BukuTamuItem[]>("pelayanan_buku_tamu.json", initialBukuTamu);
    const now = new Date();
    const dateStr = `${now.getDate()} Nov 2026`;
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} WIB`;

    const newItem: BukuTamuItem = {
      id: `GUEST-${Date.now()}`,
      nama: data.nama.trim(),
      instansi: data.instansi.trim(),
      keperluan: data.keperluan.trim(),
      nomorHp: data.nomorHp.trim(),
      penerima: data.penerima?.trim() || "Kasi Pelayanan",
      tanggal: dateStr,
      jam: timeStr,
      createdAt: now.toISOString(),
    };

    list.unshift(newItem);
    writeJsonFile("pelayanan_buku_tamu.json", list);
    revalidatePath("/dashboard");

    return { success: true, item: newItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan tamu" };
  }
}

/* =========================================================================
   6. BUKU EKSPEDISI SURAT DINAS (PERMENDAGRI NO. 47 TAHUN 2016)
   ========================================================================= */

export type BukuEkspedisiItem = {
  id: string;
  nomorUrut: number;
  tanggalKirim: string;
  tanggalDanNomorSurat: string;
  perihal: string;
  ditujukanKepada: string;
  petugasPengirim: string;
  namaPenerima?: string;
  status: "Terkirim" | "Diterima" | "Dalam Pengantaran";
  keterangan?: string;
  createdAt: string;
};

const initialBukuEkspedisi: BukuEkspedisiItem[] = [
  {
    id: "EKSP-2026-001",
    nomorUrut: 1,
    tanggalKirim: "15 Nov 2026",
    tanggalDanNomorSurat: "14 Nov 2026 / 500.3/044 - Pem",
    perihal: "Penyampaian Laporan Rekapitulasi Pelayanan Surat Keterangan Usaha (SKU) Bulan Oktober",
    ditujukanKepada: "Camat Cibungbulang C.q. Kasi Pemerintahan",
    petugasPengirim: "Staf Tata Usaha & Umum",
    namaPenerima: "Bpk. Mulyadi (Staf PATEN Kec. Cibungbulang)",
    status: "Diterima",
    keterangan: "Tanda terima berkas fisik telah diarsipkan di Bantex Ekspedisi.",
    createdAt: new Date("2026-11-15T09:00:00.000Z").toISOString(),
  },
  {
    id: "EKSP-2026-002",
    nomorUrut: 2,
    tanggalKirim: "15 Nov 2026",
    tanggalDanNomorSurat: "15 Nov 2026 / 400.12.3.1/045 - Pem",
    perihal: "Pengantar Berkas Surat Keterangan Kematian a.n. Alm. Ibu Suhartini ke Disdukcapil",
    ditujukanKepada: "Kepala Dinas Kependudukan dan Pencatatan Sipil Kab. Bogor",
    petugasPengirim: "Kaur TU & Umum",
    namaPenerima: "Loket Penerimaan Berkas Disdukcapil",
    status: "Diterima",
    keterangan: "Diterima lengkap beserta berkas fotokopi KTP dan KK asli.",
    createdAt: new Date("2026-11-15T11:30:00.000Z").toISOString(),
  },
  {
    id: "EKSP-2026-003",
    nomorUrut: 3,
    tanggalKirim: "15 Nov 2026",
    tanggalDanNomorSurat: "15 Nov 2026 / 005/046 - Pemdes",
    perihal: "Surat Undangan Rapat Koordinasi Pembinaan Wilayah RT & RW se-Desa Cimanggu I",
    ditujukanKepada: "Ketua RT 001 s.d RT 008 / RW 001 s.d RW 008",
    petugasPengirim: "Linmas Desa Cimanggu I",
    namaPenerima: "Ketua RW 001 (Bpk. H. Sukardi)",
    status: "Dalam Pengantaran",
    keterangan: "Distribusi undangan fisik ke para Ketua RW & RT.",
    createdAt: new Date("2026-11-15T14:00:00.000Z").toISOString(),
  },
];

export async function getBukuEkspedisiList(search?: string): Promise<{ success: boolean; data: BukuEkspedisiItem[] }> {
  const list = readJsonFile<BukuEkspedisiItem[]>("pelayanan_buku_ekspedisi.json", initialBukuEkspedisi);
  let filtered = list;

  if (search && search.trim() !== "") {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.tanggalDanNomorSurat.toLowerCase().includes(q) ||
        item.ditujukanKepada.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q) ||
        (item.namaPenerima && item.namaPenerima.toLowerCase().includes(q))
    );
  }

  return { success: true, data: filtered };
}

export async function createBukuEkspedisi(data: {
  tanggalKirim: string;
  tanggalDanNomorSurat: string;
  perihal: string;
  ditujukanKepada: string;
  petugasPengirim: string;
  namaPenerima?: string;
  keterangan?: string;
}): Promise<{ success: boolean; item?: BukuEkspedisiItem; error?: string }> {
  try {
    const list = readJsonFile<BukuEkspedisiItem[]>("pelayanan_buku_ekspedisi.json", initialBukuEkspedisi);
    const now = new Date();
    const count = list.length + 1;

    const newItem: BukuEkspedisiItem = {
      id: `EKSP-${Date.now()}`,
      nomorUrut: count,
      tanggalKirim: data.tanggalKirim || `${now.getDate()} Nov 2026`,
      tanggalDanNomorSurat: data.tanggalDanNomorSurat.trim(),
      perihal: data.perihal.trim(),
      ditujukanKepada: data.ditujukanKepada.trim(),
      petugasPengirim: data.petugasPengirim.trim() || "Kaur TU & Umum",
      namaPenerima: data.namaPenerima?.trim() || "",
      status: data.namaPenerima?.trim() ? "Diterima" : "Dalam Pengantaran",
      keterangan: data.keterangan?.trim() || "",
      createdAt: now.toISOString(),
    };

    list.unshift(newItem);
    writeJsonFile("pelayanan_buku_ekspedisi.json", list);
    revalidatePath("/dashboard/surat");

    return { success: true, item: newItem };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mencatat ekspedisi" };
  }
}

export async function updateBukuEkspedisiStatus(
  id: string,
  namaPenerima: string,
  status: "Diterima" | "Terkirim" | "Dalam Pengantaran"
): Promise<{ success: boolean; error?: string }> {
  try {
    const list = readJsonFile<BukuEkspedisiItem[]>("pelayanan_buku_ekspedisi.json", initialBukuEkspedisi);
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return { success: false, error: "Data ekspedisi tidak ditemukan" };

    list[idx].namaPenerima = namaPenerima;
    list[idx].status = status;
    writeJsonFile("pelayanan_buku_ekspedisi.json", list);
    revalidatePath("/dashboard/surat");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengupdate ekspedisi" };
  }
}

