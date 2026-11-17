import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

function getDirSize(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  try {
    const stat = fs.statSync(dirPath);
    if (stat.isFile()) return stat.size;
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          total += getDirSize(fullPath);
        } else if (entry.isFile()) {
          const s = fs.statSync(fullPath);
          total += s.size;
        }
      } catch {
        // Skip inaccessible entries
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
  if (mb < 0.1) {
    const kb = Math.round(bytes / 1024);
    return `${kb} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

function safelyCleanItem(targetPath: string) {
  if (!fs.existsSync(targetPath)) return;
  try {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      const items = fs.readdirSync(targetPath);
      for (const item of items) {
        const fullItem = path.join(targetPath, item);
        try {
          fs.rmSync(fullItem, { recursive: true, force: true });
        } catch {
          // Skip locked files
        }
      }
    } else if (stat.isFile()) {
      try {
        fs.unlinkSync(targetPath);
      } catch {
        // Skip locked file
      }
    }
  } catch {
    // Inaccessible
  }
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
    const cleanMode = body.mode || "SAFE"; // "SAFE" or "DEEP"

    const rootDir = process.cwd();
    const cacheDir = path.join(/*turbopackIgnore: true*/ rootDir, ".next", "cache");
    const diagnosticsDir = path.join(/*turbopackIgnore: true*/ rootDir, ".next", "diagnostics");
    const devLogsDir = path.join(/*turbopackIgnore: true*/ rootDir, ".next", "dev", "logs");
    const traceFile = path.join(/*turbopackIgnore: true*/ rootDir, ".next", "trace");
    const traceBuildFile = path.join(/*turbopackIgnore: true*/ rootDir, ".next", "trace-build");

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

    // Trace logs
    if (fs.existsSync(traceFile)) {
      totalBefore += getDirSize(traceFile);
      targetsToClean.push(traceFile);
    }
    if (fs.existsSync(traceBuildFile)) {
      totalBefore += getDirSize(traceBuildFile);
      targetsToClean.push(traceBuildFile);
    }

    // Perform safe cleaning without removing active runtime chunks
    for (const target of targetsToClean) {
      safelyCleanItem(target);
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
        if (cleanMode === "DEEP") {
          (global as any).gc();
        }
      } catch {}
    }

    // Revalidate Next.js Data Cache to refresh stale caches
    try {
      revalidatePath("/", "layout");
      revalidatePath("/master-admin");
      revalidatePath("/master-admin/stats");
    } catch {}

    // Audit log
    try {
      const tenantId = (session.user as any).tenantId || "default";
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
          tenantId: tenantId,
        }
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Pembersihan (${cleanMode === "DEEP" ? "Mode Total" : "Mode Aman"}) berhasil! Membebaskan ${formatMb(freedBytes)} ruang cache sistem.`,
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

