import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface PovertyAnalysisInput {
  nama: string;
  nik: string;
  penghasilan: number;
  jumlahTanggungan: number;
  param1?: string; // Luas lantai
  param2?: string; // Jenis lantai
  param3?: string; // Jenis dinding
  param4?: string; // Sanitasi
  param5?: string; // Penerangan
  param6?: string; // Air minum
  param7?: string; // Bahan bakar
  param8?: string; // Konsumsi protein
  param9?: string; // Frekuensi makan
  param10?: string; // Kemampuan berobat
}

export interface PovertyAnalysisResult {
  engine: string;
  timestamp: string;
  nama: string;
  nik: string;
  penghasilanTotal: number;
  penghasilanPerKapita: number;
  jumlahTanggungan: number;
  compositePovertyScore: number;
  desilCode: string;
  desilLabel: string;
  statusKelayakanUhc: string;
  indikasiAnomali: boolean;
  daftarAnomali: string[];
  rekomendasiIntervensi: string[];
  kesimpulan: string;
  statusSuccess: boolean;
  executionMode?: "PYTHON_NATIVE" | "TYPESCRIPT_FALLBACK";
}

/**
 * TypeScript Safe Fallback for Poverty & UHC Evaluation
 * (Guarantees zero-downtime even on serverless without Python runtime)
 */
function getTsPovertyFallback(input: PovertyAnalysisInput): PovertyAnalysisResult {
  const penghasilan = Number(input.penghasilan || 0);
  const tanggungan = Math.max(1, Number(input.jumlahTanggungan || 1));
  const perKapita = penghasilan / tanggungan;

  let score = 20.0;
  if (perKapita <= 350000) score += 50.0;
  else if (perKapita <= 520000) score += 35.0;
  else if (perKapita <= 900000) score += 15.0;

  if (tanggungan >= 4) score += 20.0;
  else if (tanggungan >= 2) score += 10.0;

  const scoreFinal = Math.min(100.0, Math.max(0.0, score));

  let desilCode = "DESIL_4_MAMPU";
  let desilLabel = "Desil 4+ (Keluarga Mampu / Mandiri)";
  let statusUhc = "TIDAK_LAYAK";

  if (scoreFinal >= 70.0) {
    desilCode = "DESIL_1_MISKIN_EKSTREM";
    desilLabel = "Desil 1 (Miskin Ekstrem)";
    statusUhc = "LAYAK";
  } else if (scoreFinal >= 50.0) {
    desilCode = "DESIL_2_MISKIN";
    desilLabel = "Desil 2 (Keluarga Miskin)";
    statusUhc = "LAYAK";
  } else if (scoreFinal >= 35.0) {
    desilCode = "DESIL_3_RENTAN";
    desilLabel = "Desil 3 (Rentan Miskin)";
    statusUhc = "LAYAK_DENGAN_SYARAT";
  }

  return {
    engine: "TypeScript Fallback Engine (Safe Mode)",
    timestamp: new Date().toISOString(),
    nama: input.nama,
    nik: input.nik,
    penghasilanTotal: penghasilan,
    penghasilanPerKapita: Math.round(perKapita),
    jumlahTanggungan: tanggungan,
    compositePovertyScore: scoreFinal,
    desilCode,
    desilLabel,
    statusKelayakanUhc: statusUhc,
    indikasiAnomali: false,
    daftarAnomali: [],
    rekomendasiIntervensi: statusUhc === "LAYAK" 
      ? ["Jaminan Kesehatan UHC / BPJS PBI", "Bantuan Pangan Non Tunai (BPNT)"]
      : ["Pemberdayaan Ekonomi UMKM Desa"],
    kesimpulan: `Warga ${input.nama} (${desilLabel}). Status kelayakan: ${statusUhc}.`,
    statusSuccess: true,
    executionMode: "TYPESCRIPT_FALLBACK"
  };
}

/**
 * Execute Python AI Poverty Evaluation Engine with Zero-Breakage Fallback
 */
export async function executePythonPovertyEngine(
  input: PovertyAnalysisInput
): Promise<PovertyAnalysisResult> {
  const scriptPath = path.join(process.cwd(), "services", "ai_kesra", "poverty_engine.py");

  if (!fs.existsSync(scriptPath)) {
    return getTsPovertyFallback(input);
  }

  return new Promise((resolve) => {
    try {
      const payloadString = JSON.stringify(input);
      const pythonProcess = spawn("python3", [scriptPath, payloadString], {
        timeout: 4000,
      });

      let stdoutData = "";
      let stderrData = "";

      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            resolve({
              ...parsed,
              executionMode: "PYTHON_NATIVE",
            });
            return;
          } catch (err) {
            console.warn("Failed to parse Python poverty output, using fallback:", err);
          }
        }
        resolve(getTsPovertyFallback(input));
      });

      pythonProcess.on("error", (err) => {
        console.warn("Python poverty spawn error, using fallback:", err.message);
        resolve(getTsPovertyFallback(input));
      });
    } catch (e) {
      console.warn("Exception during Python poverty dispatch:", e);
      resolve(getTsPovertyFallback(input));
    }
  });
}

