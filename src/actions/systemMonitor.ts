"use server";

import fs from "fs";
import path from "path";
import os from "os";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface SystemHealthData {
  statusSuccess: boolean;
  timestamp: string;
  loadLevel: "HEALTHY" | "WARNING" | "CRITICAL";
  warningMessage?: string;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
    osTotalMemMb: number;
    osFreeMemMb: number;
    osUsedMemMb: number;
    osUsagePercent: number;
  };
  cpu: {
    cores: number;
    model: string;
    loadAvg1m: number;
    loadAvg5m: number;
    loadAvg15m: number;
  };
  cacheGarbage: {
    totalBytes: number;
    totalMb: number;
    cacheDirBytes: number;
    diagnosticsBytes: number;
    devLogsBytes: number;
    formatted: string;
    isHeavy: boolean;
  };
  serverUptimeHours: number;
  nodeVersion: string;
}

/**
 * Utility to calculate directory size recursively
 */
function getDirectorySize(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      try {
        if (entry.isDirectory()) {
          total += getDirectorySize(fullPath);
        } else if (entry.isFile()) {
          const stat = fs.statSync(fullPath);
          total += stat.size;
        }
      } catch {
        // Skip inaccessible entries
      }
    }
  } catch {
    // Inaccessible directory
  }
  return total;
}

/**
 * Format bytes to readable string (KB, MB, GB)
 */
function formatBytes(bytes: number): string {
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

/**
 * Fetch real-time system resource & cache health metrics
 * (Accurately measures true cache, excluding active code chunks)
 */
export async function getRealtimeSystemHealth(): Promise<SystemHealthData> {
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const osUsagePercent = Math.round((usedMem / totalMem) * 100);

  const cachePath = path.join(/*turbopackIgnore: true*/ process.cwd(), ".next", "cache");
  const diagnosticsPath = path.join(/*turbopackIgnore: true*/ process.cwd(), ".next", "diagnostics");
  const devLogsPath = path.join(/*turbopackIgnore: true*/ process.cwd(), ".next", "dev", "logs");

  const cacheDirBytes = getDirectorySize(cachePath);
  const diagnosticsBytes = getDirectorySize(diagnosticsPath);
  const devLogsBytes = getDirectorySize(devLogsPath);

  // True disposable garbage: compilation cache + diagnostics + dev logs
  const totalGarbageBytes = cacheDirBytes + diagnosticsBytes + devLogsBytes;
  const totalGarbageMb = Number((totalGarbageBytes / (1024 * 1024)).toFixed(2));

  // Determine load level and warning
  let loadLevel: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
  let warningMessage = undefined;

  const isMemoryCritical = osUsagePercent >= 90 || (memUsage.heapUsed / (1024 * 1024)) > 2048;
  const isMemoryWarning = osUsagePercent >= 75 || (memUsage.heapUsed / (1024 * 1024)) > 1200;
  const isCacheCritical = totalGarbageMb > 500;
  const isCacheWarning = totalGarbageMb > 150;

  if (isMemoryCritical || isCacheCritical) {
    loadLevel = "CRITICAL";
    warningMessage = `Beban sistem tergolong TINGGI! Sampah cache mencapai ${formatBytes(totalGarbageBytes)} dan penggunaan RAM ${osUsagePercent}%. Segera bersihkan cache untuk membebaskan ruang kerja server.`;
  } else if (isMemoryWarning || isCacheWarning) {
    loadLevel = "WARNING";
    warningMessage = `Sampah cache mulai menumpuk (${formatBytes(totalGarbageBytes)}). Disarankan melakukan pembersihan berkala agar performa kompilasi & rendering tetap optimal.`;
  }

  const cpus = os.cpus();
  const loadAvg = os.loadavg();

  return {
    statusSuccess: true,
    timestamp: new Date().toISOString(),
    loadLevel,
    warningMessage,
    memory: {
      rssMb: Math.round(memUsage.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memUsage.heapUsed / (1024 * 1024)),
      heapTotalMb: Math.round(memUsage.heapTotal / (1024 * 1024)),
      osTotalMemMb: Math.round(totalMem / (1024 * 1024)),
      osFreeMemMb: Math.round(freeMem / (1024 * 1024)),
      osUsedMemMb: Math.round(usedMem / (1024 * 1024)),
      osUsagePercent,
    },
    cpu: {
      cores: cpus.length,
      model: cpus[0]?.model || "Multi-Core CPU",
      loadAvg1m: Number(loadAvg[0].toFixed(2)),
      loadAvg5m: Number(loadAvg[1].toFixed(2)),
      loadAvg15m: Number(loadAvg[2].toFixed(2)),
    },
    cacheGarbage: {
      totalBytes: totalGarbageBytes,
      totalMb: totalGarbageMb,
      cacheDirBytes,
      diagnosticsBytes,
      devLogsBytes,
      formatted: formatBytes(totalGarbageBytes),
      isHeavy: isCacheCritical || isCacheWarning,
    },
    serverUptimeHours: Number((os.uptime() / 3600).toFixed(1)),
    nodeVersion: process.version,
  };
}

/**
 * One-Click System Cache & Garbage Purge Action (Safe Version)
 */
export async function purgeSystemCacheAction(): Promise<{
  success: boolean;
  message: string;
  freedBytes: number;
  freedFormatted: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
      throw new Error("Akses Ditolak: Hanya Admin Master yang berhak membersihkan cache sistem.");
    }

    const cachePath = path.join(/*turbopackIgnore: true*/ process.cwd(), ".next", "cache");
    const diagnosticsPath = path.join(/*turbopackIgnore: true*/ process.cwd(), ".next", "diagnostics");
    const devLogsPath = path.join(/*turbopackIgnore: true*/ process.cwd(), ".next", "dev", "logs");

    const beforeBytes = getDirectorySize(cachePath) + getDirectorySize(diagnosticsPath) + getDirectorySize(devLogsPath);

    // Safely remove cache files without deleting active code chunks
    const targets = [cachePath, diagnosticsPath, devLogsPath];
    for (const target of targets) {
      if (fs.existsSync(target)) {
        try {
          const files = fs.readdirSync(target);
          for (const f of files) {
            const p = path.join(target, f);
            try {
              fs.rmSync(p, { recursive: true, force: true });
            } catch {}
          }
        } catch (err: any) {
          console.warn(`Could not fully clear ${target}:`, err.message);
        }
      }
    }

    const afterBytes = getDirectorySize(cachePath) + getDirectorySize(diagnosticsPath) + getDirectorySize(devLogsPath);
    const freedBytes = Math.max(0, beforeBytes - afterBytes);

    // Trigger V8 Garbage Collection if flag is enabled
    if (typeof (global as any).gc === "function") {
      try {
        (global as any).gc();
      } catch {}
    }

    // Record in Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "PURGE_SYSTEM_CACHE",
          entity: "SystemHealth",
          details: {
            freedBytes,
            freedFormatted: formatBytes(freedBytes),
            cleanedPaths: targets,
          },
          userId: (session.user as any).id,
          tenantId: (session.user as any).tenantId || "default",
        },
      });
    } catch {
      // Ignore audit log error
    }

    revalidatePath("/master-admin/stats");
    revalidatePath("/master-admin");

    return {
      success: true,
      message: `Berhasil membersihkan cache & sampah sistem! Membebaskan ${formatBytes(freedBytes)} ruang disk.`,
      freedBytes,
      freedFormatted: formatBytes(freedBytes),
    };
  } catch (error: any) {
    console.error("Error purging system cache:", error);
    return {
      success: false,
      message: error.message || "Gagal membersihkan cache.",
      freedBytes: 0,
      freedFormatted: "0 MB",
    };
  }
}
