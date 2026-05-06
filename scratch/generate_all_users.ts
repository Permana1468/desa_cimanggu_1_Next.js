import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://postgres.pifaowosfqnigxkudrcp:Aldyansyah_14@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Cimanggu123!', 10);
  const tenantId = 'f93e947c-1a9b-47a3-913b-2ea2a4290732';

  const users: any[] = [];

  // 1. Perangkat Utama
  users.push({ email: 'admin@cimanggu1.desa.id', fullName: 'Admin Desa', role: 'ADMIN_DESA' });
  users.push({ email: 'kades@cimanggu1.desa.id', fullName: 'Kepala Desa', role: 'KADES' });
  users.push({ email: 'sekdes@cimanggu1.desa.id', fullName: 'Sekretaris Desa', role: 'SEKDES' });
  users.push({ email: 'kaur@cimanggu1.desa.id', fullName: 'KAUR Umum', role: 'KAUR' });
  users.push({ email: 'kasi@cimanggu1.desa.id', fullName: 'KASI Pelayanan', role: 'KASI' });

  // 2. Lembaga
  users.push({ email: 'bumdes@cimanggu1.desa.id', fullName: 'Pengelola BUMDES', role: 'BUMDES' });
  users.push({ email: 'lpm@cimanggu1.desa.id', fullName: 'Ketua LPM', role: 'LPM' });
  users.push({ email: 'karangtaruna@cimanggu1.desa.id', fullName: 'Ketua Karang Taruna', role: 'KARANG_TARUNA' });
  users.push({ email: 'sensus_baru@cimanggu1.desa.id', fullName: 'Petugas Sensus Utama', role: 'PETUGAS_SENSUS' });
  users.push({ email: 'puskesos_baru@cimanggu1.desa.id', fullName: 'Petugas Puskesos Utama', role: 'PUSKESOS' });

  // 3. RW 001 - 009
  for (let i = 1; i <= 9; i++) {
    const rwNum = i.toString().padStart(3, '0');
    users.push({ 
      email: `rw${rwNum}@cimanggu1.desa.id`, 
      fullName: `Ketua RW ${rwNum}`, 
      role: 'RW',
      rw: rwNum 
    });

    // 4. RT per RW
    let maxRT = 5;
    if (i === 9) maxRT = 2; // RW 009 only has 2 RTs
    if (i >= 6 && i <= 8) maxRT = 4; // Variatif

    for (let j = 1; j <= maxRT; j++) {
      const rtNum = j.toString().padStart(3, '0');
      users.push({
        email: `rt${rtNum}.rw${rwNum}@cimanggu1.desa.id`,
        fullName: `Ketua RT ${rtNum} RW ${rwNum}`,
        role: 'RT',
        rt: rtNum,
        rw: rwNum
      });
    }
  }

  console.log(`Starting generation of ${users.length} users...`);

  for (const u of users) {
    try {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          fullName: u.fullName,
          role: u.role,
          passwordHash,
          isActive: true,
          tenantId,
          rt: u.rt || null,
          rw: u.rw || null
        },
        create: {
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          passwordHash,
          isActive: true,
          tenantId,
          rt: u.rt || null,
          rw: u.rw || null
        }
      });
      console.log(`✅ Created: ${u.email}`);
    } catch (err) {
      console.error(`❌ Failed: ${u.email}`, err);
    }
  }

  console.log("\nDONE! All accounts created.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
