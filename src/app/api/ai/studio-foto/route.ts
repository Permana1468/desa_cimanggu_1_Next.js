import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { spawn } from "child_process";
import path from "path";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Helper to resolve Gemini API Key strictly from Admin Master / Server
async function getMasterGeminiApiKey(): Promise<string> {
  // 1. Database SystemSetting (global_config -> aiIntegration) set by Master Admin
  try {
    const configRecord = await prisma.systemSetting.findUnique({
      where: { id: "global_config" },
    });
    const settings = (configRecord?.settings as any) || {};
    const dbKey = settings.aiIntegration?.apiKey;
    if (dbKey && typeof dbKey === "string" && dbKey.trim()) {
      return dbKey.trim();
    }
  } catch (err) {
    console.warn("[STUDIO_FOTO_AI] Unable to query systemSetting:", err);
  }

  // 2. Fallback to Server Environment Variables
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();

  return "";
}

// Execute Python AI Engine
function runPythonRealisticGenerator(payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "services", "ai_studio", "realistic_generator.py");
    const pyProcess = spawn("python3", [scriptPath], {
      env: { ...process.env },
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
      if (code !== 0 && !stdoutData) {
        return reject(new Error(stderrData || `Python AI engine exited with code ${code}`));
      }

      try {
        const jsonResult = JSON.parse(stdoutData.trim());
        resolve(jsonResult);
      } catch (err: any) {
        reject(new Error(`Failed to parse Python output: ${stdoutData.slice(0, 200)}`));
      }
    });

    pyProcess.on("error", (err) => {
      reject(err);
    });

    // Write input payload to stdin
    pyProcess.stdin.write(JSON.stringify(payload));
    pyProcess.stdin.end();
  });
}

// GET: Check status and verify Admin Master key integration
export async function GET() {
  try {
    const masterKey = await getMasterGeminiApiKey();
    return NextResponse.json({
      status: "online",
      engine: "Python 3.12 AI Engine & Google Gemini Multimodal",
      hasMasterKey: Boolean(masterKey),
      keySource: masterKey ? "Admin Master (Terkonfigurasi)" : "Belum Diatur di Admin Master",
      supportedModes: [
        "product",
        "fashion",
        "prewedding",
        "model",
        "photographer_passport",
        "photographer_umrah",
        "photographer_baby",
        "architecture_interior",
        "architecture_exterior",
        "sketch_to_photo",
        "art_caricature",
        "edit_restore",
        "banner",
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Error checking AI engine status" },
      { status: 500 }
    );
  }
}

// POST: Execute Realistic AI generation via Python engine
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      mode = "general", 
      prompt = "", 
      customInstruction = "", 
      aspectRatio = "1:1", 
      imageBase64 = "", 
      mimeType = "image/jpeg" 
    } = body;

    // Strict security: API Key is retrieved ONLY from Admin Master / server configuration
    const apiKey = (await getMasterGeminiApiKey()) || "";

    if (!prompt && !imageBase64) {
      return NextResponse.json(
        { success: false, error: "Deskripsi (prompt) atau gambar input wajib diisi." },
        { status: 400 }
      );
    }

    // Call Python Realistic Generator Engine
    try {
      const pythonResult = await runPythonRealisticGenerator({
        apiKey,
        mode,
        prompt,
        customInstruction,
        aspectRatio,
        imageBase64,
        mimeType,
      });

      if (pythonResult.success) {
        return NextResponse.json(pythonResult);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: pythonResult.error || "Gagal menghasilkan gambar realistis.",
          },
          { status: 422 }
        );
      }
    } catch (pyErr: any) {
      console.error("[PYTHON_AI_ENGINE_ERROR]", pyErr);
      return NextResponse.json(
        {
          success: false,
          error: `Kesalahan pada Python AI Engine: ${pyErr.message || "Proses eksekusi gagal."}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[STUDIO_FOTO_AI_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Terjadi kesalahan internal server saat memproses permintaan AI.",
      },
      { status: 500 }
    );
  }
}
