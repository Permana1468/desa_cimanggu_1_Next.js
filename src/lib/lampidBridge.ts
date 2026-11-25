import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface LampidEngineInput {
  month: number;
  year: number;
  residents: {
    nik: string;
    noKK?: string;
    jenisKelamin?: string | null;
    tanggalLahir?: string | Date | null;
    statusKependudukan?: string | null;
    hubunganKeluarga?: string | null;
    rt?: string;
    rw?: string;
  }[];
  births: {
    namaBayi: string;
    jenisKelamin?: string | null;
    tanggalLahir?: string | Date | null;
    rt?: string;
    rw?: string;
  }[];
  deaths: {
    nik: string;
    namaLengkap: string;
    jenisKelamin?: string | null;
    tanggalMeninggal: string | Date;
    rt?: string;
    rw?: string;
  }[];
  moves: {
    nik: string;
    namaLengkap: string;
    jenisKelamin?: string | null;
    tanggalPindah: string | Date;
    rt?: string;
    rw?: string;
  }[];
  incomings: {
    nik: string;
    noKK?: string | null;
    namaLengkap: string;
    jenisKelamin?: string | null;
    tanggalDatang: string | Date;
    rt?: string;
    rw?: string;
  }[];
}

export interface LampidEngineResult {
  engine: string;
  month: number;
  year: number;
  isBalanced: boolean;
  persamaanMatematis: string;
  saldoAwal: { L: number; P: number; total: number };
  mutasiTambah: {
    lahir: { L: number; P: number; total: number };
    datang: { L: number; P: number; total: number };
    total: { L: number; P: number; total: number };
  };
  mutasiKurang: {
    mati: { L: number; P: number; total: number };
    pindah: { L: number; P: number; total: number };
    total: { L: number; P: number; total: number };
  };
  saldoAkhir: { L: number; P: number; total: number };
  kartuKeluarga: {
    awal: number;
    tambah: number;
    kurang: number;
    akhir: number;
    isBalanced: boolean;
  };
  wajibKtp: { L: number; P: number; total: number };
  ageDistribution: Record<string, { L: number; P: number }>;
  wilayahBreakdown: {
    rw: string;
    totalWarga: number;
    lakiLaki: number;
    perempuan: number;
    totalKk: number;
    rts: Record<string, { totalWarga: number; lakiLaki: number; perempuan: number }>;
  }[];
  executionMode: "PYTHON" | "TYPESCRIPT_FALLBACK";
}

function normalizeGk(val?: string | null): "L" | "P" {
  if (!val) return "L";
  const s = val.trim().toUpperCase().replace(/[-_\s]+/g, "");
  if (s.startsWith("P") || s.includes("PEREMPUAN") || s.includes("FEMALE") || s === "F") return "P";
  return "L";
}

export function computeTsLampidFallback(data: LampidEngineInput): LampidEngineResult {
  const { month, year, residents, births, deaths, moves, incomings } = data;

  const deadNiks = new Set(deaths.map(d => d.nik).filter(Boolean));
  const movedNiks = new Set(moves.map(m => m.nik).filter(Boolean));

  const activeResidents = residents.filter(r => !deadNiks.has(r.nik) && !movedNiks.has(r.nik));

  const ageDist: Record<string, { L: number; P: number }> = { "0-11 BLN": { L: 0, P: 0 } };
  for (let i = 1; i <= 74; i++) {
    ageDist[i.toString()] = { L: 0, P: 0 };
  }
  ageDist["75+"] = { L: 0, P: 0 };

  let wajibL = 0;
  let wajibP = 0;

  activeResidents.forEach(r => {
    if (!r.tanggalLahir) return;
    const bDate = new Date(r.tanggalLahir);
    if (isNaN(bDate.getTime())) return;

    const totalMonths = (year - bDate.getFullYear()) * 12 + (month - (bDate.getMonth() + 1));
    if (totalMonths < 0) return;

    const age = Math.floor(totalMonths / 12);
    const gk = normalizeGk(r.jenisKelamin);

    if (totalMonths <= 11) ageDist["0-11 BLN"][gk]++;
    else if (age >= 75) ageDist["75+"][gk]++;
    else if (age >= 1 && age <= 74) ageDist[age.toString()][gk]++;

    if (age >= 17) {
      if (gk === "L") wajibL++;
      else wajibP++;
    }
  });

  const resGkMap = new Map<string, "L" | "P">();
  residents.forEach(r => {
    if (r.nik) resGkMap.set(r.nik, normalizeGk(r.jenisKelamin));
  });

  const lahirL = births.filter(b => normalizeGk(b.jenisKelamin) === "L").length;
  const lahirP = births.filter(b => normalizeGk(b.jenisKelamin) === "P").length;

  let matiL = 0;
  let matiP = 0;
  deaths.forEach(d => {
    const gk = resGkMap.get(d.nik) || normalizeGk(d.jenisKelamin);
    if (gk === "L") matiL++;
    else matiP++;
  });

  let pindahL = 0;
  let pindahP = 0;
  moves.forEach(m => {
    const gk = resGkMap.get(m.nik) || normalizeGk(m.jenisKelamin);
    if (gk === "L") pindahL++;
    else pindahP++;
  });

  let datangL = 0;
  let datangP = 0;
  incomings.forEach(i => {
    const gk = resGkMap.get(i.nik) || normalizeGk(i.jenisKelamin);
    if (gk === "L") datangL++;
    else datangP++;
  });

  const akhirL = activeResidents.filter(r => normalizeGk(r.jenisKelamin) === "L").length;
  const akhirP = activeResidents.filter(r => normalizeGk(r.jenisKelamin) === "P").length;
  const akhirTotal = akhirL + akhirP;

  const tambahL = lahirL + datangL;
  const tambahP = lahirP + datangP;
  const tambahTotal = tambahL + tambahP;

  const kurangL = matiL + pindahL;
  const kurangP = matiP + pindahP;
  const kurangTotal = kurangL + kurangP;

  const awalL = Math.max(0, akhirL - tambahL + kurangL);
  const awalP = Math.max(0, akhirP - tambahP + kurangP);
  const awalTotal = awalL + awalP;

  const isBalanced = (awalTotal + tambahTotal - kurangTotal) === akhirTotal;

  // Family Cards (KK)
  const activeKks = new Set(activeResidents.map(r => r.noKK).filter(Boolean));
  const kkAkhir = activeKks.size;
  const incomingKks = new Set(incomings.map(i => i.noKK).filter(Boolean));
  const kkTambah = incomingKks.size;

  const allKks = new Set(residents.map(r => r.noKK).filter(Boolean));
  let kkKurang = 0;
  allKks.forEach(kk => {
    if (!activeKks.has(kk)) kkKurang++;
  });
  const kkAwal = Math.max(0, kkAkhir - kkTambah + kkKurang);
  const kkBalanced = (kkAwal + kkTambah - kkKurang) === kkAkhir;

  // Breakdown by sub-wilayah
  const wMap = new Map<string, {
    rw: string;
    totalWarga: number;
    lakiLaki: number;
    perempuan: number;
    kks: Set<string>;
    rts: Record<string, { totalWarga: number; lakiLaki: number; perempuan: number }>;
  }>();

  activeResidents.forEach(r => {
    const rw = r.rw || "001";
    const rt = r.rt || "001";
    if (!wMap.has(rw)) {
      wMap.set(rw, {
        rw,
        totalWarga: 0,
        lakiLaki: 0,
        perempuan: 0,
        kks: new Set(),
        rts: {}
      });
    }
    const item = wMap.get(rw)!;
    item.totalWarga++;
    const gk = normalizeGk(r.jenisKelamin);
    if (gk === "L") item.lakiLaki++;
    else item.perempuan++;
    if (r.noKK) item.kks.add(r.noKK);

    if (!item.rts[rt]) item.rts[rt] = { totalWarga: 0, lakiLaki: 0, perempuan: 0 };
    item.rts[rt].totalWarga++;
    if (gk === "L") item.rts[rt].lakiLaki++;
    else item.rts[rt].perempuan++;
  });

  const wilayahBreakdown = Array.from(wMap.values()).map(v => ({
    rw: v.rw,
    totalWarga: v.totalWarga,
    lakiLaki: v.lakiLaki,
    perempuan: v.perempuan,
    totalKk: v.kks.size,
    rts: v.rts
  }));

  return {
    engine: "TypeScript Demographic Balance Engine",
    month,
    year,
    isBalanced: isBalanced && kkBalanced,
    persamaanMatematis: `${awalTotal} (Awal) + ${tambahTotal} (Tambah) - ${kurangTotal} (Kurang) = ${akhirTotal} (Akhir)`,
    saldoAwal: { L: awalL, P: awalP, total: awalTotal },
    mutasiTambah: {
      lahir: { L: lahirL, P: lahirP, total: lahirL + lahirP },
      datang: { L: datangL, P: datangP, total: datangL + datangP },
      total: { L: tambahL, P: tambahP, total: tambahTotal }
    },
    mutasiKurang: {
      mati: { L: matiL, P: matiP, total: matiL + matiP },
      pindah: { L: pindahL, P: pindahP, total: pindahL + pindahP },
      total: { L: kurangL, P: kurangP, total: kurangTotal }
    },
    saldoAkhir: { L: akhirL, P: akhirP, total: akhirTotal },
    kartuKeluarga: {
      awal: kkAwal,
      tambah: kkTambah,
      kurang: kkKurang,
      akhir: kkAkhir,
      isBalanced: kkBalanced
    },
    wajibKtp: { L: wajibL, P: wajibP, total: wajibL + wajibP },
    ageDistribution: ageDist,
    wilayahBreakdown,
    executionMode: "TYPESCRIPT_FALLBACK"
  };
}

/**
 * Execute Python Demographic Balance Engine with seamless TypeScript fallback
 */
export async function executeLampidEngine(input: LampidEngineInput): Promise<LampidEngineResult> {
  const scriptPath = path.join(process.cwd(), "services", "demografi", "lampid_engine.py");

  if (!fs.existsSync(scriptPath)) {
    return computeTsLampidFallback(input);
  }

  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify(input);
      const py = spawn("python3", [scriptPath, payload], { timeout: 4000 });

      let out = "";
      let err = "";

      py.stdout.on("data", (chunk) => {
        out += chunk.toString();
      });

      py.stderr.on("data", (chunk) => {
        err += chunk.toString();
      });

      py.on("close", (code) => {
        if (code === 0 && out.trim()) {
          try {
            const parsed = JSON.parse(out.trim());
            if (!parsed.error) {
              resolve({
                ...parsed,
                executionMode: "PYTHON"
              });
              return;
            }
          } catch (e) {
            console.warn("Failed to parse python lampid_engine output:", e);
          }
        }
        resolve(computeTsLampidFallback(input));
      });

      py.on("error", (e) => {
        console.warn("Python lampid_engine spawn error:", e.message);
        resolve(computeTsLampidFallback(input));
      });
    } catch (e) {
      console.warn("Exception during Python lampid_engine execution:", e);
      resolve(computeTsLampidFallback(input));
    }
  });
}

