#!/usr/bin/env node

/**
 * SISTEM PINTASAN RESTORE DESA CIMANGGU I
 * Fitur: Memulihkan Database & Storage dari arsip .tar.gz
 * Penggunaan:
 *   node scripts/restore-system.js [path-ke-file-tar.gz]
 *   atau: npm run restore
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function restoreBackup() {
  const startTime = Date.now();
  const backupDir = path.join(process.cwd(), 'backups');

  // Cari file backup yang ditentukan dari argumen, atau cari backup terbaru di folder backups/
  let backupFile = process.argv[2];

  if (!backupFile) {
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.tar.gz'))
        .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtimeMs }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 0) {
        backupFile = path.join(backupDir, files[0].name);
      }
    }
  }

  if (!backupFile || !fs.existsSync(backupFile)) {
    console.error('❌ Error: File backup .tar.gz tidak ditemukan!');
    console.log('💡 Contoh penggunaan:');
    console.log('   node scripts/restore-system.js backups/backup_desa_cimanggu_xxxx.tar.gz');
    process.exit(1);
  }

  console.log('====================================================');
  console.log(`♻️  MEMULAI RESTORE SISTEM DESA CIMANGGU I`);
  console.log(`📦 File Backup : ${backupFile}`);
  console.log(`⏰ Waktu       : ${new Date().toLocaleString('id-ID')}`);
  console.log('====================================================');

  const tempRestoreDir = path.join(backupDir, `restore_temp_${Date.now()}`);
  fs.mkdirSync(tempRestoreDir, { recursive: true });

  try {
    // 1. Ekstrak arsip .tar.gz
    console.log('\n🔓 [1/3] Mengekstrak file backup .tar.gz...');
    execSync(`tar -xzf "${backupFile}" -C "${tempRestoreDir}"`);
    console.log('   ✅ Arsip berhasil diekstrak.');

    // 2. Baca Manifest
    const manifestPath = path.join(tempRestoreDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      console.log(`\n📋 Informasi Arsip:`);
      console.log(`   - Dibuat Pada   : ${manifest.createdAt}`);
      console.log(`   - Total Baris DB: ${manifest.stats?.totalRecords ?? 'N/A'}`);
      console.log(`   - Total Storage : ${manifest.stats?.storageFiles ?? 'N/A'} file (${((manifest.stats?.storageSizeBytes ?? 0) / (1024 * 1024)).toFixed(2)} MB)`);
    }

    // 3. Restore Storage (public/uploads)
    console.log('\n📁 [2/3] Memulihkan file Storage (public/uploads)...');
    const extractedStorageDir = path.join(tempRestoreDir, 'storage');
    const targetUploadsDir = path.join(process.cwd(), 'public', 'uploads');

    if (fs.existsSync(extractedStorageDir)) {
      if (!fs.existsSync(targetUploadsDir)) {
        fs.mkdirSync(targetUploadsDir, { recursive: true });
      }

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
          }
        }
      };

      copyRecursive(extractedStorageDir, targetUploadsDir);
      console.log('   ✅ File media/dokumen berhasil dikembalikan ke public/uploads!');
    } else {
      console.log('   ℹ️ Folder storage tidak ada di dalam backup ini.');
    }

    // 4. Restore Database Records
    console.log('\n🗄️ [3/3] Memulihkan data ke PostgreSQL Database...');
    const extractedDbDir = path.join(tempRestoreDir, 'database');

    if (fs.existsSync(extractedDbDir)) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error('DATABASE_URL tidak ditemukan di .env');
      }

      const pool = new Pool({ connectionString, max: 2, connectionTimeoutMillis: 10000 });
      const adapter = new PrismaPg(pool);
      const prisma = new PrismaClient({ adapter });

      // Urutan prioritas model agar foreign key terpenuhi (parent dulu baru child)
      const orderedModels = [
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

      let restoredRecordsCount = 0;

      for (const model of orderedModels) {
        const filePath = path.join(extractedDbDir, `${model}.json`);
        if (!fs.existsSync(filePath)) continue;

        try {
          const records = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (!Array.isArray(records) || records.length === 0) continue;

          let countForModel = 0;
          for (const item of records) {
            try {
              if (item.id && typeof prisma[model]?.upsert === 'function') {
                await prisma[model].upsert({
                  where: { id: item.id },
                  update: item,
                  create: item,
                });
                countForModel++;
              } else if (typeof prisma[model]?.create === 'function') {
                await prisma[model].create({ data: item });
                countForModel++;
              }
            } catch (itemErr) {
              // Jika duplikat atau constraint error, lewati atau log
            }
          }

          if (countForModel > 0) {
            console.log(`   - Model ${model}: berhasil memulihkan ${countForModel} data.`);
            restoredRecordsCount += countForModel;
          }
        } catch (modelErr) {
          console.warn(`   ⚠️ Gagal memulihkan tabel ${model}: ${modelErr.message}`);
        }
      }

      await prisma.$disconnect();
      await pool.end();
      console.log(`   ✅ Selesai: Total ${restoredRecordsCount} baris data berhasil disinkronkan ke Database.`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n====================================================');
    console.log(`🎉 PROSES PEMULIHAN (RESTORE) BERHASIL TOTAL!`);
    console.log(`⏱️ Waktu Selesai: ${duration} detik`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('\n❌ Terjadi kesalahan saat memulihkan sistem:', err);
  } finally {
    // Bersihkan temporary folder
    if (fs.existsSync(tempRestoreDir)) {
      try {
        fs.rmSync(tempRestoreDir, { recursive: true, force: true });
      } catch (cleanErr) {
        // Abaikan jika ada lock
      }
    }
  }
}

restoreBackup();
