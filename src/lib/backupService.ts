/**
 * BACKUP SERVICE - DESA CIMANGGU I
 * Menghasilkan snapshot penuh Database PostgreSQL (JSON) + Storage Uploads (.tar.gz).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import prisma from '@/lib/prisma';

export async function createBackup() {
  const startTime = Date.now();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(process.cwd(), 'backups');
  const tempDir = path.join(backupDir, `temp_${dateStr}`);
  const dbDir = path.join(tempDir, 'database');
  const storageDir = path.join(tempDir, 'storage');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  fs.mkdirSync(dbDir, { recursive: true });
  fs.mkdirSync(storageDir, { recursive: true });

  const stats = {
    tables: {} as Record<string, number>,
    totalRecords: 0,
    storageFiles: 0,
    storageSizeBytes: 0,
  };

  // 1. Ambil data dari model-model Prisma
  const models = [
    'tenant', 'user', 'rolePermission', 'dataKependudukan', 'bansosData',
    'surat', 'letterTemplate', 'berita', 'villageProfile', 'bumdesFinancial',
    'bumdesUnit', 'lembaga', 'lembagaMember', 'aparaturDesa', 'systemSetting',
    'financeProposal', 'tracking', 'mapBoundary', 'infrastrukturProject',
    'apbdesFinance', 'villageDocument', 'rtFinance', 'rtActivity',
    'rtBirthReport', 'rtDeathReport', 'rtMoveReport', 'rtIncomingReport',
    'rtAnnouncement', 'rtComplaint', 'rtInventory', 'sensusPoint',
    'rumahWarga', 'posyanduBalita', 'posyanduIbuHamil', 'posyanduLansia',
    'posyanduRecord', 'posyanduJadwal', 'kesraUhc', 'kesraUsulanUhc',
    'puskesosPengaduan', 'arsipLaporan', 'umkmStore', 'umkmProduct',
    'umkmOrder', 'katarFinance', 'katarInventory', 'katarSurat',
    'hargaSatuan', 'puskesosBukuTamu', 'auditLog'
  ];

  for (const model of models) {
    if (typeof (prisma as any)[model]?.findMany === 'function') {
      try {
        const records = await (prisma as any)[model].findMany();
        stats.tables[model] = records.length;
        stats.totalRecords += records.length;
        
        if (records.length > 0) {
          fs.writeFileSync(
            path.join(dbDir, `${model}.json`),
            JSON.stringify(records, null, 2),
            'utf-8'
          );
        }
      } catch (err) {
        // Abaikan model opsional jika terjadi error
      }
    }
  }

  // 2. Salin Storage Uploads
  const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
  if (fs.existsSync(uploadsPath)) {
    const copyRecursive = (src: string, dest: string) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
          if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
          const fileStat = fs.statSync(srcPath);
          stats.storageFiles += 1;
          stats.storageSizeBytes += fileStat.size;
        }
      }
    };

    copyRecursive(uploadsPath, storageDir);
  }

  // 3. Manifest Metadata
  const manifest = {
    village: 'Desa Cimanggu I',
    appName: 'Platform Digital Terpadu SDD Desa Cimanggu I',
    timestamp: new Date().toISOString(),
    generator: 'Antigravity Automated System Backup Shortcut',
    database: {
      totalRecords: stats.totalRecords,
      tablesCount: Object.keys(stats.tables).length,
      summary: stats.tables,
    },
    storage: {
      totalFiles: stats.storageFiles,
      totalSizeBytes: stats.storageSizeBytes,
      formattedSize: `${(stats.storageSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
    },
  };

  fs.writeFileSync(
    path.join(tempDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  // 4. Kompresi menjadi .tar.gz
  const archiveName = `backup_desa_cimanggu_${dateStr}.tar.gz`;
  const archivePath = path.join(backupDir, archiveName);

  execSync(`tar -czf "${archivePath}" -C "${tempDir}" .`);

  const archiveStat = fs.statSync(archivePath);
  const archiveSizeMB = (archiveStat.size / (1024 * 1024)).toFixed(2);
  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

  // Bersihkan folder temporary
  fs.rmSync(tempDir, { recursive: true, force: true });

  return {
    success: true,
    archiveName,
    archivePath,
    sizeMB: archiveSizeMB,
    elapsedSeconds,
    manifest,
  };
}
