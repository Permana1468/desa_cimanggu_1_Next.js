import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Helper to resolve Gemini API Key
async function resolveGeminiApiKey(explicitKey?: string | null, headerKey?: string | null): Promise<string> {
  // 1. Explicit key in body or header
  if (explicitKey && explicitKey.trim()) return explicitKey.trim();
  if (headerKey && headerKey.trim()) return headerKey.trim();

  // 2. Server Environment Variables
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();

  // 3. Database SystemSetting (global_config -> aiIntegration)
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

  return "";
}

// GET: Check status and key availability
export async function GET(req: NextRequest) {
  try {
    const serverKey = await resolveGeminiApiKey();
    return NextResponse.json({
      status: "online",
      engine: "Google Gemini AI Engine",
      hasServerKey: Boolean(serverKey),
      supportedModels: [
        "gemini-2.5-flash-image",
        "gemini-2.5-flash-image-preview",
        "gemini-2.5-flash",
        "gemini-flash-latest",
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Error checking AI engine status" },
      { status: 500 }
    );
  }
}

// POST: Proxy generation request to Google Gemini API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model = "gemini-2.5-flash-image", payload, apiKey: clientKey } = body;
    const headerKey = req.headers.get("x-gemini-key");

    const apiKey = await resolveGeminiApiKey(clientKey, headerKey);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Kunci API Gemini belum diatur. Silakan masukkan Google Gemini API Key di tombol Pengaturan Kunci API (pojok kanan atas).",
          needApiKey: true,
        },
        { status: 401 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        { error: "Payload generasi tidak valid atau kosong." },
        { status: 400 }
      );
    }

    // Smart model candidate mapping
    let modelCandidates: string[] = [];

    if (model.includes("image")) {
      // Prioritize available Google image models
      modelCandidates = [
        "gemini-2.5-flash-image",
        model,
        "gemini-2.5-flash-image-preview",
        "imagen-3.0-generate-002",
      ];
    } else {
      // Text / concept generation models
      modelCandidates = [
        model,
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash",
      ];
    }

    const uniqueCandidates = Array.from(new Set(modelCandidates));
    let lastError: any = null;
    let geminiRes: Response | null = null;
    let geminiData: any = null;

    for (const candModel of uniqueCandidates) {
      try {
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${candModel}:generateContent?key=${apiKey}`;
        
        geminiRes = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        geminiData = await geminiRes.json();

        if (geminiRes.ok) {
          return NextResponse.json(geminiData);
        }

        // If 404 (model not found), continue to fallback model
        if (geminiRes.status === 404) {
          lastError = geminiData;
          continue;
        }

        // If other error (e.g. 400 bad key, 429 quota), stop and return friendly error
        let friendlyMessage = geminiData.error?.message || "Gagal memproses dengan AI.";
        if (geminiRes.status === 400 && friendlyMessage.toLowerCase().includes("api key not valid")) {
          friendlyMessage = "API Key Gemini tidak valid. Pastikan Anda menyalin kunci dari Google AI Studio dengan benar.";
        } else if (geminiRes.status === 429) {
          friendlyMessage = "Batas kuota Gemini API tercapai (Rate Limit). Silakan coba lagi beberapa saat lagi atau gunakan API Key lain.";
        }

        return NextResponse.json(
          {
            error: friendlyMessage,
            status: geminiRes.status,
            raw: geminiData,
          },
          { status: geminiRes.status }
        );
      } catch (err: any) {
        lastError = err;
      }
    }

    return NextResponse.json(
      {
        error: lastError?.error?.message || lastError?.message || "Gagal menghubungi layanan Google Gemini.",
        status: 502,
      },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("[STUDIO_FOTO_AI_ERROR]", error);
    return NextResponse.json(
      {
        error: error?.message || "Terjadi kesalahan internal server saat memproses permintaan AI.",
      },
      { status: 500 }
    );
  }
}
