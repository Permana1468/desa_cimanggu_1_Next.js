import { spawn } from "child_process";
import path from "path";
import { POSYANDU_UNITS } from "./posyandu";

export interface BalitaDemografiPayload {
  citizens: any[];
  posyanduBalita: any[];
  filterPosyandu?: string;
  referenceDate?: string;
}

export interface BalitaDemografiResult {
  engine: string;
  referenceDate: string;
  summary: {
    totalBalita: number;
    totalBalitaKependudukan: number;
    totalTerdaftarPosyandu: number;
    totalBelumTerdaftarPosyandu: number;
    totalBelumMasukKK: number;
    totalStunting: number;
    persentaseCakupan: number;
  };
  rekapKelompokUmur: Array<{
    code: string;
    label: string;
    total: number;
    L: number;
    P: number;
    registered: number;
    unregistered: number;
  }>;
  rekapPosyanduMawar: Array<{
    id: string;
    name: string;
    unitCode: string;
    rws: string[];
    rtDesc: string;
    totalBalita: number;
    registered: number;
    unregistered: number;
    stuntingCount: number;
    belumMasukKK: number;
    L: number;
    P: number;
  }>;
  balita: any[];
  totalFiltered: number;
}

/**
 * Execute Python Balita Demografi Engine with TS Fallback
 */
export async function runBalitaDemografiEngine(payload: BalitaDemografiPayload): Promise<BalitaDemografiResult> {
  const pythonScript = path.join(process.cwd(), "services", "ai_posyandu", "balita_demografi_engine.py");

  try {
    const pythonResult = await new Promise<string>((resolve, reject) => {
      const child = spawn("python3", [pythonScript]);
      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0 && stdout.trim()) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        }
      });

      child.on("error", (err) => {
        reject(err);
      });

      // Write JSON payload to stdin
      child.stdin.write(JSON.stringify(payload));
      child.stdin.end();

      // Guard timeout 5s
      setTimeout(() => {
        child.kill();
        reject(new Error("Python execution timed out (5s)"));
      }, 5000);
    });

    const parsed = JSON.parse(pythonResult);
    if (parsed && !parsed.error) {
      return parsed;
    }
    throw new Error(parsed.error || "Invalid python output");
  } catch (err: any) {
    console.warn("[BalitaDemografiEngine] Python subprocess fallback to TypeScript:", err.message);
    return computeBalitaDemografiTS(payload);
  }
}

/**
 * High-performance In-Memory TypeScript Fallback
 */
function cleanRw(val: any): string {
  const s = String(val || "").trim();
  const digits = s.replace(/\D/g, "");
  return digits ? digits.padStart(3, "0") : "001";
}

function resolvePosyanduUnit(rw: string) {
  const norm = cleanRw(rw);
  for (const u of POSYANDU_UNITS) {
    if (u.rws.some(r => cleanRw(r) === norm)) {
      return u;
    }
  }
  return POSYANDU_UNITS[0];
}

export function computeBalitaDemografiTS(payload: BalitaDemografiPayload): BalitaDemografiResult {
  const refDate = payload.referenceDate ? new Date(payload.referenceDate) : new Date();
  const citizens = payload.citizens || [];
  const posyanduRecords = payload.posyanduBalita || [];
  const filter = payload.filterPosyandu || "ALL";

  const posyanduByNik = new Map<string, any>();
  const posyanduByName = new Map<string, any>();

  for (const pb of posyanduRecords) {
    const nik = String(pb.nik || "").trim();
    if (nik && nik !== "-" && nik.length >= 10) {
      posyanduByNik.set(nik, pb);
    }
    const cleanName = String(pb.namaLengkap || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const cRt = cleanRw(pb.rt || "001");
    const cRw = cleanRw(pb.rw || "001");
    posyanduByName.set(`${cleanName}_${cRt}_${cRw}`, pb);
  }

  const matchedIds = new Set<string>();
  const balitaList: any[] = [];

  for (const c of citizens) {
    const status = String(c.statusKependudukan || "AKTIF").toUpperCase();
    if (status === "MENINGGAL" || status === "PINDAH_KELUAR") continue;

    if (!c.tanggalLahir) continue;
    const bDate = new Date(c.tanggalLahir);
    if (isNaN(bDate.getTime())) continue;

    // Age calculation
    let years = refDate.getFullYear() - bDate.getFullYear();
    let months = refDate.getMonth() - bDate.getMonth();
    let days = refDate.getDate() - bDate.getDate();

    if (days < 0) {
      months -= 1;
      days += 30;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalMonths = Math.max(0, years * 12 + months);
    if (totalMonths > 60) continue; // Balita max 5 years

    const rw = cleanRw(c.rw || "001");
    const rt = cleanRw(c.rt || "001");
    const unit = resolvePosyanduUnit(rw);

    const nikClean = String(c.nik || "").trim();
    const cleanName = String(c.namaLengkap || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

    let pbMatch: any = null;
    if (nikClean && posyanduByNik.has(nikClean)) {
      pbMatch = posyanduByNik.get(nikClean);
    } else if (posyanduByName.has(`${cleanName}_${rt}_${rw}`)) {
      pbMatch = posyanduByName.get(`${cleanName}_${rt}_${rw}`);
    }

    const isReg = !!pbMatch;
    if (pbMatch) matchedIds.add(pbMatch.id);

    let bracketCode = "0-5_BLN";
    let bracketLabel = "0 - 5 Bulan (ASI Eksklusif)";
    if (totalMonths < 6) {
      bracketCode = "0-5_BLN";
      bracketLabel = "0 - 5 Bulan (ASI Eksklusif)";
    } else if (totalMonths < 12) {
      bracketCode = "6-11_BLN";
      bracketLabel = "6 - 11 Bulan (MP-ASI Awal)";
    } else if (totalMonths < 24) {
      bracketCode = "12-23_BLN";
      bracketLabel = "12 - 23 Bulan (Baduta 1-2 Thn)";
    } else if (totalMonths < 36) {
      bracketCode = "24-35_BLN";
      bracketLabel = "24 - 35 Bulan (Balita 2-3 Thn)";
    } else if (totalMonths < 60) {
      bracketCode = "36-59_BLN";
      bracketLabel = "36 - 59 Bulan (Pra-Sekolah 3-5 Thn)";
    } else {
      bracketCode = "60_BLN";
      bracketLabel = "60 Bulan (Lulus Posyandu)";
    }

    const jkRaw = String(c.jenisKelamin || "L").toUpperCase();
    const gender = (jkRaw === "L" || jkRaw === "LAKI_LAKI" || jkRaw === "PRIA") ? "L" : "P";
    const usiaLabel = totalMonths < 12 ? `${totalMonths} Bulan ${days > 0 ? `${days} Hari` : ""}` : `${years} Tahun ${months > 0 ? `${months} Bulan` : ""}`;

    balitaList.push({
      id: pbMatch ? pbMatch.id : `warga-${c.id}`,
      wargaId: c.id,
      nik: nikClean,
      noKK: String(c.noKK || "").trim(),
      namaLengkap: String(c.namaLengkap || "").trim().toUpperCase(),
      tempatLahir: c.tempatLahir || "Bogor",
      tanggalLahir: bDate.toISOString().split("T")[0],
      usiaBulan: totalMonths,
      usiaLabel: usiaLabel.trim(),
      usiaDetail: { totalMonths, years, remainingMonths: months, days, label: usiaLabel.trim() },
      kelompokUmur: { code: bracketCode, label: bracketLabel },
      jenisKelamin: gender,
      namaOrangTua: c.namaIbu || c.namaAyah || "-",
      rt,
      rw,
      dusun: c.dusun || "Dusun I",
      alamat: c.alamat || "Desa Cimanggu I",
      posyanduId: unit.id,
      posyanduCode: unit.code,
      posyanduName: unit.name,
      posyanduUnitCode: unit.unitCode,
      isRegisteredInPosyandu: isReg,
      posyanduBalitaId: pbMatch ? pbMatch.id : null,
      statusStunting: pbMatch ? Boolean(pbMatch.statusStunting) : false,
      inKependudukan: true,
      needsRegistration: !isReg,
      statusFisikKK: "TERDAFTAR_KK"
    });
  }

  // PosyanduBalita not in Kependudukan
  for (const pb of posyanduRecords) {
    if (!matchedIds.has(pb.id)) {
      const bDate = pb.tanggalLahir ? new Date(pb.tanggalLahir) : new Date();
      const years = refDate.getFullYear() - bDate.getFullYear();
      const months = refDate.getMonth() - bDate.getMonth();
      const totalMonths = Math.max(0, years * 12 + months);

      const rw = cleanRw(pb.rw || "001");
      const rt = cleanRw(pb.rt || "001");
      const unit = resolvePosyanduUnit(rw);

      balitaList.push({
        id: pb.id,
        wargaId: null,
        nik: String(pb.nik || "").trim(),
        noKK: "BELUM_MASUK_KK",
        namaLengkap: String(pb.namaLengkap || "").trim().toUpperCase(),
        tempatLahir: "Bogor",
        tanggalLahir: bDate.toISOString().split("T")[0],
        usiaBulan: totalMonths,
        usiaLabel: `${totalMonths} Bulan`,
        usiaDetail: { totalMonths, years, remainingMonths: 0, days: 0, label: `${totalMonths} Bulan` },
        kelompokUmur: { code: "BELUM_TERDATA", label: "Terdaftar Fisik di Posyandu" },
        jenisKelamin: pb.jenisKelamin === "P" ? "P" : "L",
        namaOrangTua: pb.namaOrangTua || "-",
        rt,
        rw,
        dusun: "-",
        alamat: `RT ${rt} / RW ${rw}`,
        posyanduId: unit.id,
        posyanduCode: unit.code,
        posyanduName: pb.posyanduName || unit.name,
        posyanduUnitCode: unit.unitCode,
        isRegisteredInPosyandu: true,
        posyanduBalitaId: pb.id,
        statusStunting: Boolean(pb.statusStunting),
        inKependudukan: false,
        needsRegistration: false,
        statusFisikKK: "BELUM_MASUK_KK_FISIK_TERCATAT"
      });
    }
  }

  // Sort by age (youngest to oldest)
  balitaList.sort((a, b) => a.usiaBulan - b.usiaBulan);

  const rekapUmur: Record<string, any> = {
    "0-5_BLN": { label: "0 - 5 Bulan (ASI Eksklusif)", total: 0, L: 0, P: 0, registered: 0, unregistered: 0 },
    "6-11_BLN": { label: "6 - 11 Bulan (MP-ASI Awal)", total: 0, L: 0, P: 0, registered: 0, unregistered: 0 },
    "12-23_BLN": { label: "12 - 23 Bulan (Baduta 1-2 Thn)", total: 0, L: 0, P: 0, registered: 0, unregistered: 0 },
    "24-35_BLN": { label: "24 - 35 Bulan (Balita 2-3 Thn)", total: 0, L: 0, P: 0, registered: 0, unregistered: 0 },
    "36-59_BLN": { label: "36 - 59 Bulan (Pra-Sekolah 3-5 Thn)", total: 0, L: 0, P: 0, registered: 0, unregistered: 0 },
    "60_BLN": { label: "60 Bulan (Lulus Posyandu)", total: 0, L: 0, P: 0, registered: 0, unregistered: 0 }
  };

  const rekapMawar = POSYANDU_UNITS.map(u => ({
    id: u.id,
    name: u.name,
    unitCode: u.unitCode,
    rws: u.rws,
    rtDesc: u.rtDescription,
    totalBalita: 0,
    registered: 0,
    unregistered: 0,
    stuntingCount: 0,
    belumMasukKK: 0,
    L: 0,
    P: 0
  }));

  let totalKependudukan = 0;
  let totalRegistered = 0;
  let totalUnregistered = 0;
  let totalBelumMasukKK = 0;
  let totalStunting = 0;

  for (const b of balitaList) {
    const code = b.kelompokUmur.code;
    if (rekapUmur[code]) {
      rekapUmur[code].total += 1;
      if (b.jenisKelamin === "L") rekapUmur[code].L += 1;
      else rekapUmur[code].P += 1;
      if (b.isRegisteredInPosyandu) rekapUmur[code].registered += 1;
      else rekapUmur[code].unregistered += 1;
    }

    const m = rekapMawar.find(rm => rm.id === b.posyanduId);
    if (m) {
      m.totalBalita += 1;
      if (b.jenisKelamin === "L") m.L += 1;
      else m.P += 1;
      if (b.isRegisteredInPosyandu) m.registered += 1;
      else m.unregistered += 1;
      if (b.statusStunting) m.stuntingCount += 1;
      if (!b.inKependudukan) m.belumMasukKK += 1;
    }

    if (b.inKependudukan) totalKependudukan += 1;
    if (b.isRegisteredInPosyandu) totalRegistered += 1;
    else totalUnregistered += 1;
    if (!b.inKependudukan) totalBelumMasukKK += 1;
    if (b.statusStunting) totalStunting += 1;
  }

  let filtered = balitaList;
  if (filter && filter !== "ALL") {
    const norm = filter.toLowerCase().replace(/[\s_]/g, "");
    filtered = balitaList.filter(b => 
      b.posyanduId.toLowerCase() === norm ||
      b.posyanduCode.toLowerCase().replace(/_/g, "") === norm ||
      b.posyanduName.toLowerCase().replace(/\s/g, "") === norm ||
      filter.includes(b.rw)
    );
  }

  return {
    engine: "TypeScript In-Memory Demografi Engine (Fail-Safe)",
    referenceDate: refDate.toISOString().split("T")[0],
    summary: {
      totalBalita: balitaList.length,
      totalBalitaKependudukan: totalKependudukan,
      totalTerdaftarPosyandu: totalRegistered,
      totalBelumTerdaftarPosyandu: totalUnregistered,
      totalBelumMasukKK: totalBelumMasukKK,
      totalStunting: totalStunting,
      persentaseCakupan: balitaList.length > 0 ? Math.round((totalRegistered / balitaList.length) * 1000) / 10 : 0
    },
    rekapKelompokUmur: Object.entries(rekapUmur).map(([k, v]) => ({ code: k, ...v })),
    rekapPosyanduMawar: rekapMawar,
    balita: filtered,
    totalFiltered: filtered.length
  };
}
