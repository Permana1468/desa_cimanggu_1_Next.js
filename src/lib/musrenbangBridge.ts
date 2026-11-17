import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export interface MusrenbangProposalInput {
  id?: string;
  kegiatanPrioritas: string;
  lokasiRw: string;
  lokasiRt: string;
  lokasiDetail?: string;
  volume?: string;
  satuan?: string;
  anggaran: number;
  penerimaManfaat?: number;
  urgensiBencana?: number; // 1-10
  keselarasanRpjm?: number; // 1-10
  kerentananWilayah?: number; // 1-10
}

export interface RankedProposal {
  id: string;
  kegiatanPrioritas: string;
  lokasiRw: string;
  lokasiRt: string;
  lokasiDetail?: string;
  volume?: string;
  satuan?: string;
  anggaran: number;
  penerimaManfaat: number;
  scoreTopsis: number;
  rank: number;
  rekomendasiStatus: string;
  catatanKelayakan: string;
  metrics: {
    dPlus: number;
    dMinus: number;
    urgensi: number;
    biayaPerJiwa: number;
  };
}

export interface MusrenbangAnalysisResult {
  engine: string;
  statusSuccess: boolean;
  totalProposals: number;
  rankedProposals: RankedProposal[];
  executionMode?: "PYTHON_AI" | "TYPESCRIPT_FALLBACK";
}

/**
 * Pure TypeScript fallback calculation for Musrenbang TOPSIS ranking
 */
function getTsMusrenbangFallback(proposals: MusrenbangProposalInput[]): MusrenbangAnalysisResult {
  const ranked: RankedProposal[] = proposals.map((p, idx) => {
    const urgensi = p.urgensiBencana ?? 5;
    const manfaat = Math.max(1, p.penerimaManfaat ?? 100);
    const anggaran = p.anggaran ?? 10000000;
    const biayaPerJiwa = anggaran / manfaat;

    // Simple heuristic score
    const score = Number(((urgensi * 0.4) + (Math.min(manfaat, 500) / 500 * 0.3) + (100000 / Math.max(100000, biayaPerJiwa) * 0.3)).toFixed(4));
    
    return {
      id: p.id || `prop-${idx + 1}`,
      kegiatanPrioritas: p.kegiatanPrioritas,
      lokasiRw: p.lokasiRw,
      lokasiRt: p.lokasiRt,
      lokasiDetail: p.lokasiDetail || "-",
      volume: p.volume || "-",
      satuan: p.satuan || "-",
      anggaran,
      penerimaManfaat: manfaat,
      scoreTopsis: score,
      rank: 1,
      rekomendasiStatus: score >= 0.6 ? "Prioritas 1 (Didanai APBDes)" : "Prioritas 2 (Diusulkan ke Musrenbangcam)",
      catatanKelayakan: "Kalkulasi fallback berbasis analisis heuristik darurat.",
      metrics: {
        dPlus: 0.05,
        dMinus: 0.05,
        urgensi,
        biayaPerJiwa,
      },
    };
  });

  ranked.sort((a, b) => b.scoreTopsis - a.scoreTopsis);
  ranked.forEach((item, i) => {
    item.rank = i + 1;
  });

  return {
    engine: "TypeScript MCDM Fallback Core",
    statusSuccess: true,
    totalProposals: ranked.length,
    rankedProposals: ranked,
    executionMode: "TYPESCRIPT_FALLBACK",
  };
}

/**
 * Execute Python AI Musrenbang Prioritizer Core
 */
export async function executePythonMusrenbangEngine(
  proposals: MusrenbangProposalInput[]
): Promise<MusrenbangAnalysisResult> {
  const scriptPath = path.join(process.cwd(), "services", "ai_perencanaan", "musrenbang_engine.py");

  if (!fs.existsSync(scriptPath)) {
    return getTsMusrenbangFallback(proposals);
  }

  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify({ proposals });
      const pyProcess = spawn("python3", [scriptPath, payload], {
        timeout: 5000,
      });

      let stdoutData = "";
      let stderrData = "";

      pyProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      pyProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      pyProcess.on("close", (code) => {
        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            resolve({
              ...parsed,
              executionMode: "PYTHON_AI",
            });
            return;
          } catch (err) {
            console.warn("Failed to parse python musrenbang_engine output:", err);
          }
        }
        resolve(getTsMusrenbangFallback(proposals));
      });

      pyProcess.on("error", (err) => {
        console.warn("Python musrenbang_engine spawn error:", err.message);
        resolve(getTsMusrenbangFallback(proposals));
      });
    } catch (e) {
      console.warn("Exception during Python musrenbang_engine dispatch:", e);
      resolve(getTsMusrenbangFallback(proposals));
    }
  });
}

