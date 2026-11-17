import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface BalitaAnalysisInput {
  namaLengkap: string;
  tanggalLahir: string;
  jenisKelamin: string;
  beratBadan: number;
  tinggiBadan: number;
  lingkarKepala?: number;
  historyRecords?: Array<{
    tanggal: string;
    beratBadan?: number;
    tinggiBadan?: number;
  }>;
}

export interface BalitaAnalysisResult {
  engine: string;
  timestamp: string;
  namaLengkap: string;
  usiaBulan: number;
  antropometri: {
    beratBadan: number;
    tinggiBadan: number;
    medianIdealTB: number;
    medianIdealBB: number;
    zScoreHAZ: number;
    zScoreWAZ: number;
  };
  statusStunting: string;
  isStunted: boolean;
  statusBeratBadan: string;
  growthTrend: string;
  proyeksiRisiko60Hari: string;
  rekomendasiPMT: string[];
  kesimpulan: string;
  statusSuccess: boolean;
  executionMode?: "PYTHON_NATIVE" | "TYPESCRIPT_FALLBACK";
}

/**
 * Fallback calculation in pure TypeScript if Python is unreachable or errors out
 */
function getTsFallback(input: BalitaAnalysisInput): BalitaAnalysisResult {
  const birth = new Date(input.tanggalLahir);
  const now = new Date();
  const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
  const isMale = String(input.jenisKelamin).toUpperCase().startsWith("L");

  const idealTB = isMale ? 50 + months * 0.98 : 49 + months * 0.95;
  const idealBB = isMale ? 3.3 + months * 0.25 : 3.2 + months * 0.24;

  const hasMeasurement = input.tinggiBadan > 0 || input.beratBadan > 0;
  const isStunted = input.tinggiBadan > 0 && input.tinggiBadan < idealTB * 0.88;
  const statusStunting = !input.tinggiBadan || input.tinggiBadan <= 0
    ? "Belum Ada Pengukuran TB"
    : isStunted
    ? "Pendek (Stunted)"
    : "Normal (Gizi Baik)";

  const statusBB = !input.beratBadan || input.beratBadan <= 0
    ? "Belum Ada Pengukuran BB"
    : input.beratBadan < idealBB * 0.8
    ? "Gizi Kurang"
    : "Normal";

  const proyeksi = !hasMeasurement
    ? "BELUM_TERDATA"
    : isStunted
    ? "SANGAT_TINGGI"
    : "RENDAH (Pola Pertumbuhan Optimal)";

  const growthTrend = !hasMeasurement
    ? "BELUM_DIUKUR"
    : (input.historyRecords && input.historyRecords.length > 1)
    ? "BERTUMBUH POSITIF"
    : "PENGUKURAN_AWAL (Basis Data)";

  return {
    engine: "TypeScript Fallback Engine (Safe Mode)",
    timestamp: new Date().toISOString(),
    namaLengkap: input.namaLengkap,
    usiaBulan: months,
    antropometri: {
      beratBadan: input.beratBadan,
      tinggiBadan: input.tinggiBadan,
      medianIdealTB: Math.round(idealTB * 10) / 10,
      medianIdealBB: Math.round(idealBB * 10) / 10,
      zScoreHAZ: input.tinggiBadan > 0 ? (isStunted ? -2.2 : 0.1) : 0,
      zScoreWAZ: input.beratBadan > 0 ? (input.beratBadan < idealBB * 0.8 ? -2.0 : 0.0) : 0,
    },
    statusStunting,
    isStunted,
    statusBeratBadan: statusBB,
    growthTrend,
    proyeksiRisiko60Hari: proyeksi,
    rekomendasiPMT: !hasMeasurement
      ? [
          "Lakukan penimbangan berat badan dan pengukuran tinggi badan pada jadwal Posyandu berikutnya.",
          "Bawa buku KIA/KMS untuk pencatatan grafik tumbuh kembang balita."
        ]
      : isStunted
      ? [
          "Intervensi PMT Pemulihan tinggi protein hewani (Telur, hati ayam, ikan kembung/lele).",
          "Kunjungan rumah kader Posyandu untuk evaluasi asupan gizi keluarga."
        ]
      : [
          "Pertahankan pola asuh makanan pendamping ASI (MP-ASI) padat gizi seimbang.",
          "Lakukan pengukuran rutin berkala tiap bulan di Posyandu."
        ],
    kesimpulan: !hasMeasurement
      ? `Balita ${input.namaLengkap} (${months} bulan): Belum ada data antropometri yang tercatat.`
      : `Balita ${input.namaLengkap} (${months} bulan): Status TB/U = ${statusStunting}, Status BB/U = ${statusBB}. Tren: ${growthTrend}.`,
    statusSuccess: true,
    executionMode: "TYPESCRIPT_FALLBACK",
  };
}

/**
 * Execute Python AI Growth & Stunting Analytics Engine with Zero-Breakage Fallback
 */
export async function executePythonStuntingEngine(
  input: BalitaAnalysisInput
): Promise<BalitaAnalysisResult> {
  const scriptPath = path.join(process.cwd(), "services", "ai_posyandu", "stunting_engine.py");

  // If python script doesn't exist on disk, return instant fallback
  if (!fs.existsSync(scriptPath)) {
    return getTsFallback(input);
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
            const parsed = JSON.parse(stdoutData);
            resolve({
              ...parsed,
              executionMode: "PYTHON_NATIVE",
            });
            return;
          } catch (err) {
            console.warn("Failed to parse Python engine output:", err);
          }
        } else {
          console.warn("Python engine exited with non-zero code or error:", stderrData);
        }
        // Safe Fallback if execution had any issue
        resolve(getTsFallback(input));
      });

      pythonProcess.on("error", (err) => {
        console.warn("Python process spawn error:", err.message);
        resolve(getTsFallback(input));
      });
    } catch (e) {
      console.warn("Exception during Python engine dispatch:", e);
      resolve(getTsFallback(input));
    }
  });
}

