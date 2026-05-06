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

  // 1. LPM 001 - 009
  for (let i = 1; i <= 9; i++) {
    const num = i.toString().padStart(3, '0');
    users.push({ email: `lpm${num}@cimanggu1.desa.id`, fullName: `LPM Unit ${num}`, role: 'LPM' });
  }

  // 2. POSYANDU 001 - 007
  for (let i = 1; i <= 7; i++) {
    const num = i.toString().padStart(3, '0');
    users.push({ email: `posyandu${num}@cimanggu1.desa.id`, fullName: `Posyandu Unit ${num}`, role: 'POSYANDU' });
  }

  // 3. KADUS 1 - 4
  for (let i = 1; i <= 4; i++) {
    users.push({ email: `kadus${i}@cimanggu1.desa.id`, fullName: `Kepala Dusun ${i}`, role: 'KADUS' });
  }

  // 4. KASI & KAUR Tambahan
  users.push({ email: `kasi_pemerintahan@cimanggu1.desa.id`, fullName: `KASI Pemerintahan`, role: 'KASI' });
  users.push({ email: `kasi_kesejahteraan@cimanggu1.desa.id`, fullName: `KASI Kesejahteraan`, role: 'KASI' });
  users.push({ email: `kasi_pelayanan@cimanggu1.desa.id`, fullName: `KASI Pelayanan`, role: 'KASI' });
  users.push({ email: `kaur_tu@cimanggu1.desa.id`, fullName: `KAUR Tata Usaha`, role: 'KAUR' });
  users.push({ email: `kaur_keuangan@cimanggu1.desa.id`, fullName: `KAUR Keuangan`, role: 'KAUR' });
  users.push({ email: `kaur_perencanaan@cimanggu1.desa.id`, fullName: `KAUR Perencanaan`, role: 'KAUR' });

  // 5. RE-CREATE SENSUS & PUSKESOS (Fresh)
  users.push({ email: `petugas_sensus@cimanggu1.desa.id`, fullName: `Petugas Sensus Desa`, role: 'PETUGAS_SENSUS' });
  users.push({ email: `petugas_puskesos@cimanggu1.desa.id`, fullName: `Petugas Puskesos Desa`, role: 'PUSKESOS' });

  console.log(`Starting generation of ${users.length} additional users...`);

  for (const u of users) {
    try {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          fullName: u.fullName,
          role: u.role,
          passwordHash,
          isActive: true,
          tenantId
        },
        create: {
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          passwordHash,
          isActive: true,
          tenantId
        }
      });
      console.log(`✅ Created: ${u.email}`);
    } catch (err) {
      console.error(`❌ Failed: ${u.email}`, err);
    }
  }

  console.log("\nDONE! All additional accounts created.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
