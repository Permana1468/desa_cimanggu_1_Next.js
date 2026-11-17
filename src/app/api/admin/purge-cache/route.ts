import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

function getDirSize(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          total += getDirSize(fullPath);
        } else if (entry.isFile()) {
          const stat = fs.statSync(fullPath);
          total += stat.size;
        }
      } catch {
        // Skip
      }
    }
  } catch {
    // Inaccessible
  }
  return total;
}

function formatMb(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
      return NextResponse.json(
        { success: false, message: "Akses Ditolak: Hanya Admin Master yang memiliki hak akses." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const cleanMode = body.mode || "ALL"; // "FAST", "DEEP", "ALL"

    const rootDir = process.cwd();
    const cacheDir = path.join(/*turbopackIgnore: true*/ rootDir, ".next", "cache");
    const diagnosticsDir = path.join(/*turbopackIgnore: true*/ rootDir, ".next", "diagnostics");
    const devLogsDir = path.join(/*turbopackIgnore: true*/ rootDir, ".next", "dev", "logs");

    let totalBefore = 0;
    const targetsToClean: string[] = [];

    // Always safe to clean compilation cache and fetch cache
    if (fs.existsSync(cacheDir)) {
      totalBefore += getDirSize(cacheDir);
      targetsToClean.push(cacheDir);
    }

    // Diagnostics / trace files
    if (fs.existsSync(diagnosticsDir)) {
      totalBefore += getDirSize(diagnosticsDir);
      targetsToClean.push(diagnosticsDir);
    }

    // Dev logs (NEVER delete active dev chunks)
    if (fs.existsSync(devLogsDir)) {
      totalBefore += getDirSize(devLogsDir);
      targetsToClean.push(devLogsDir);
    }

    // Perform safe cleaning
    for (const target of targetsToClean) {
      try {
        if (fs.existsSync(target)) {
          // Remove subcontents instead of destroying the directory itself
          const items = fs.readdirSync(target);
          for (const item of items) {
            const p = path.join(target, item);
            try {
              fs.rmSync(p, { recursive: true, force: true });
            } catch {
              // Ignore locked files
            }
          }
        }
      } catch (err: any) {
        console.warn(`[SafePurge] Could not fully clear ${target}:`, err.message);
      }
    }

    let totalAfter = 0;
    for (const target of targetsToClean) {
      totalAfter += getDirSize(target);
    }

    const freedBytes = Math.max(0, totalBefore - totalAfter);

    // Free V8 Heap Memory if GC is available
    if (typeof (global as any).gc === "function") {
      try {
        (global as any).gc();
      } catch {}
    }

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "PURGE_SYSTEM_CACHE",
          entity: "SystemHealth",
          details: {
            freedBytes,
            freedFormatted: formatMb(freedBytes),
            cleanedTargets: targetsToClean,
            mode: cleanMode
          },
          userId: (session.user as any).id,
          tenantId: (session.user as any).tenantId,
        }
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Pembersihan berhasil! Membebaskan ${formatMb(freedBytes)} ruang cache sistem.`,
      freedBytes,
      freedFormatted: formatMb(freedBytes),
    });
  } catch (error: any) {
    console.error("Purge cache API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses pembersihan cache." },
      { status: 500 }
    );
  }
}

