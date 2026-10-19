import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { createBackup } from "@/lib/backupService";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized: Silakan login terlebih dahulu" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const allowedRoles = ["ADMIN_MASTER", "ADMIN_DESA", "KADES", "SEKDES"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Akses ditolak: Hanya Administrator Master / Pemdes yang berhak mendownload backup sistem." }, { status: 403 });
    }

    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Check if query parameter requests fresh backup
    const url = new URL(req.url);
    const forceFresh = url.searchParams.get("fresh") === "true";

    // Find most recent backup
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith("backup_desa_cimanggu_") && f.endsWith(".tar.gz"))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        mtime: fs.statSync(path.join(backupDir, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime);

    let targetFile = files[0];

    // If no file exists or forceFresh is requested, generate fresh backup
    if (!targetFile || forceFresh) {
      const result = await createBackup();
      targetFile = {
        name: result.archiveName,
        path: result.archivePath,
        mtime: Date.now()
      };
    }

    const stat = fs.statSync(targetFile.path);
    const fileStream = fs.createReadStream(targetFile.path);

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: (session.user as any).tenantId || "f93e947c-1a9b-47a3-913b-2ea2a4290732",
          userId: (session.user as any).id,
          action: "DOWNLOAD_BACKUP",
          entity: "SystemBackup",
          category: "SYSTEM",
          details: {
            filename: targetFile.name,
            sizeMB: (stat.size / (1024 * 1024)).toFixed(2)
          }
        }
      });
    } catch (e) {
      // Continue even if audit log fails
    }

    // Web stream for Next.js App Router
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on("data", chunk => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", err => controller.error(err));
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${targetFile.name}"`,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      }
    });
  } catch (error: any) {
    console.error("Error in backup download route:", error);
    return NextResponse.json({ error: error.message || "Gagal memproses backup" }, { status: 500 });
  }
}
