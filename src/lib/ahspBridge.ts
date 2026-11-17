import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface AhspKomponenInput {
  kategori: "UPAH" | "BAHAN" | "ALAT";
  uraian: string;
  satuan: string;
  koefisien: number;
  hargaSatuan: number;
}

export interface AhspPekerjaanInput {
  kode: string;
  uraian: string;
  volume: number;
  satuan: string;
  overheadPercent?: number;
  komponen: AhspKomponenInput[];
}

export interface AhspProjectInput {
  proyekNama: string;
  items: AhspPekerjaanInput[];
}

export interface AhspItemCalculated {
  kode: string;
  uraian: string;
  volume: number;
  satuan: string;
  subtotalUpahPerUnit: number;
  subtotalBahanPerUnit: number;
  subtotalAlatPerUnit: number;
  biayaLangsungSatuan: number;
  overheadPercent: number;
  overheadSatuan: number;
  hargaSatuanPekerjaan: number;
  totalBiayaItem: number;
}

export interface AhspLogistikMaterial {
  material: string;
  totalKebutuhanVolume: number;
}

export interface AhspProjectResult {
  engine: string;
  statusSuccess: boolean;
  proyekNama: string;
  totalItemPekerjaan: number;
  itemsCalculated: AhspItemCalculated[];
  ringkasanBiaya: {
    grandTotalUpah: number;
    grandTotalBahan: number;
    grandTotalAlat: number;
    biayaLangsungTotal: number;
    overheadKeuntunganTotal: number;
    totalFisikPekerjaan: number;
    estimasiPpn11: number;
    estimasiPph22: number;
    grandTotalRAB: number;
  };
  kebutuhanLogistikMaterial: AhspLogistikMaterial[];
  executionTimeMicros?: number;
  computationalComplexity: string;
  executionMode?: "CPP_NATIVE" | "TYPESCRIPT_FALLBACK";
}

/**
 * Pure TypeScript fallback calculation for AHSP & RAB Construction
 * (Guarantees zero downtime even if native binary is missing)
 */
function getTsAhspFallback(input: AhspProjectInput): AhspProjectResult {
  const items = input.items && input.items.length > 0 ? input.items : [];
  
  let grandTotalUpah = 0;
  let grandTotalBahan = 0;
  let grandTotalAlat = 0;
  let grandTotalLangsung = 0;
  let grandTotalOverhead = 0;
  let grandTotalFisik = 0;

  const materialMap = new Map<string, number>();

  const itemsCalculated: AhspItemCalculated[] = items.map((it) => {
    let subUpah = 0;
    let subBahan = 0;
    let subAlat = 0;
    const overheadPct = it.overheadPercent ?? 10;

    for (const k of it.komponen || []) {
      const costPerUnit = (k.koefisien || 0) * (k.hargaSatuan || 0);
      const totalKebutuhan = (k.koefisien || 0) * (it.volume || 1);

      if (k.kategori === "UPAH") {
        subUpah += costPerUnit;
      } else if (k.kategori === "BAHAN") {
        subBahan += costPerUnit;
        const key = `${k.uraian} (${k.satuan})`;
        materialMap.set(key, (materialMap.get(key) || 0) + totalKebutuhan);
      } else if (k.kategori === "ALAT") {
        subAlat += costPerUnit;
        const key = `${k.uraian} (${k.satuan})`;
        materialMap.set(key, (materialMap.get(key) || 0) + totalKebutuhan);
      }
    }

    const biayaLangsungSatuan = subUpah + subBahan + subAlat;
    const overheadSatuan = biayaLangsungSatuan * (overheadPct / 100);
    const hargaSatuanPekerjaan = biayaLangsungSatuan + overheadSatuan;
    const totalBiayaItem = hargaSatuanPekerjaan * (it.volume || 1);

    grandTotalUpah += subUpah * (it.volume || 1);
    grandTotalBahan += subBahan * (it.volume || 1);
    grandTotalAlat += subAlat * (it.volume || 1);
    grandTotalLangsung += biayaLangsungSatuan * (it.volume || 1);
    grandTotalOverhead += overheadSatuan * (it.volume || 1);
    grandTotalFisik += totalBiayaItem;

    return {
      kode: it.kode,
      uraian: it.uraian,
      volume: it.volume,
      satuan: it.satuan,
      subtotalUpahPerUnit: subUpah,
      subtotalBahanPerUnit: subBahan,
      subtotalAlatPerUnit: subAlat,
      biayaLangsungSatuan,
      overheadPercent: overheadPct,
      overheadSatuan,
      hargaSatuanPekerjaan,
      totalBiayaItem,
    };
  });

  const kebutuhanLogistikMaterial: AhspLogistikMaterial[] = Array.from(materialMap.entries()).map(([material, totalKebutuhanVolume]) => ({
    material,
    totalKebutuhanVolume: Number(totalKebutuhanVolume.toFixed(2)),
  }));

  return {
    engine: "TypeScript AHSP Calculation Fallback",
    statusSuccess: true,
    proyekNama: input.proyekNama || "RAB Proyek Fisik Desa Cimanggu I",
    totalItemPekerjaan: items.length,
    itemsCalculated,
    ringkasanBiaya: {
      grandTotalUpah,
      grandTotalBahan,
      grandTotalAlat,
      biayaLangsungTotal: grandTotalLangsung,
      overheadKeuntunganTotal: grandTotalOverhead,
      totalFisikPekerjaan: grandTotalFisik,
      estimasiPpn11: grandTotalFisik * 0.11,
      estimasiPph22: grandTotalBahan * 0.015,
      grandTotalRAB: grandTotalFisik,
    },
    kebutuhanLogistikMaterial,
    computationalComplexity: "O(N*M) TypeScript",
    executionMode: "TYPESCRIPT_FALLBACK",
  };
}

/**
 * Execute Native C++ AHSP & RAB Construction Calculation Engine
 */
export async function executeCppAhspEngine(input: AhspProjectInput): Promise<AhspProjectResult> {
  const binPath = path.join(process.cwd(), "services", "cpp_geo", "bin", "ahsp_engine");

  if (!fs.existsSync(binPath)) {
    return getTsAhspFallback(input);
  }

  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify(input);
      const cppProcess = spawn(binPath, [payload], {
        timeout: 4000,
      });

      let stdoutData = "";
      let stderrData = "";

      cppProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      cppProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      cppProcess.on("close", (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            resolve({
              ...parsed,
              executionMode: "CPP_NATIVE",
            });
            return;
          } catch (err) {
            console.warn("Failed to parse C++ ahsp_engine output, falling back to TS:", err);
          }
        }
        resolve(getTsAhspFallback(input));
      });

      cppProcess.on("error", (err) => {
        console.warn("C++ ahsp_engine spawn error, using fallback:", err.message);
        resolve(getTsAhspFallback(input));
      });
    } catch (e) {
      console.warn("Exception during C++ ahsp_engine dispatch:", e);
      resolve(getTsAhspFallback(input));
    }
  });
}

