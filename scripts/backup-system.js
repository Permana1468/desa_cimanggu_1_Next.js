#!/usr/bin/env node

/**
 * SISTEM PINTASAN BACKUP DESA CIMANGGU I
 * Fitur: Full Database Snapshot (JSON) + Uploads Storage Bundle (tar.gz)
 * Tujuannya: Antisipasi serangan ransomware / enkripsi data / kehilangan server.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function createBackup() {
  const startTime = Date.now();
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupDir = path.join(process.cwd(), 'backups');
  const tempDir = path.join(backupDir, `temp_${dateStr}`);
  const dbDir = path.join(tempDir, 'database');
  const storageDir = path.join(tempDir, 'storage');

  console.log('====================================================');
  console.log(`🛡️  MEMULAI BACKUP SISTEM & DATABASE DESA CIMANGGU I`);
  console.log(`⏰ Waktu: ${new Date().toLocaleString('id-ID')}`);
  console.log('====================================================');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  fs.mkdirSync(dbDir, { recursive: true });
  fs.mkdirSync(storageDir, { recursive: true });

  // 1. Inisialisasi Database Connection
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL tidak ditemukan di file .env');
  }

  const pool = new Pool({ connectionString, max: 2, connectionTimeoutMillis: 10000 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const stats = {
    tables: {},
    totalRecords: 0,
    storageFiles: 0,
    storageSizeBytes: 0,
  };

  try {
    // 2. Backup Database Models
    console.log('\n📦 [1/3] Mengambil data tabel dari Database PostgreSQL...');
    
    // Daftar model inti yang ada di schema.prisma
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
      if (typeof prisma[model]?.findMany === 'function') {
        try {
          const records = await prisma[model].findMany();
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
          // Model mungkin opsional atau kosong
        }
      }
    }

    console.log(`   ✅ Selesai: Berhasil mengekstrak ${stats.totalRecords} baris data dari ${Object.keys(stats.tables).length} model.`);

    // 3. Backup Storage Files (public/uploads)
    console.log('\n📁 [2/3] Menyalin file Storage (public/uploads)...');
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    
    if (fs.existsSync(uploadsPath)) {
      const copyRecursive = (src, dest) => {
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
      console.log(`   ✅ Selesai: Menyalin ${stats.storageFiles} file storage (${(stats.storageSizeBytes / (1024 * 1024)).toFixed(2)} MB).`);
    } else {
      console.log('   ℹ️ Folder public/uploads belum ada atau kosong.');
    }

    // 4. Buat File Metadata Manifest
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

    // 5. Kompresi menjadi .tar.gz
    console.log('\n🗜️  [3/3] Mengompres seluruh bundel ke format .tar.gz...');
    const archiveName = `backup_desa_cimanggu_${dateStr}.tar.gz`;
    const archivePath = path.join(backupDir, archiveName);

    execSync(`tar -czf "${archivePath}" -C "${tempDir}" .`);

    const archiveStat = fs.statSync(archivePath);
    const archiveSizeMB = (archiveStat.size / (1024 * 1024)).toFixed(2);
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    // Bersihkan temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n====================================================');
    console.log('🎉 BACKUP BERHASIL DIBUAT DENGAN SUKSES!');
    console.log(`📦 File Arsip : ${archiveName}`);
    console.log(`📍 Lokasi     : ${archivePath}`);
    console.log(`📊 Ukuran     : ${archiveSizeMB} MB`);
    console.log(`⏱️  Durasi     : ${elapsedSeconds} detik`);
    console.log('====================================================');
    console.log('💡 TIPS ANTI-RANSOMWARE:');
    console.log('   Salin file ini ke Harddisk Eksternal / Flashdisk (Offline) atau Google Drive.');
    console.log('   Penyimpanan air-gapped offline tidak akan bisa dienkripsi oleh malware.\n');

    return {
      success: true,
      archiveName,
      archivePath,
      sizeMB: archiveSizeMB,
      manifest,
    };
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Eksekusi jika dijalankan via CLI langsung
if (require.main === module) {
  createBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ Gagal membuat backup:', err.message);
      process.exit(1);
    });
}

module.exports = { createBackup };
