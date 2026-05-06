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

  const users: any[] = [
    { email: 'petugas001@cimanggu1.desa.id', fullName: 'Petugas Operasional 01', role: 'PERANGKAT_DESA' },
    { email: 'petugas002@cimanggu1.desa.id', fullName: 'Petugas Operasional 02', role: 'PERANGKAT_DESA' }
  ];

  console.log(`Creating fresh Petugas accounts...`);

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

  // Disable the old problematic accounts just in case
  await prisma.user.updateMany({
    where: { 
      role: { in: ['PETUGAS_SENSUS', 'PUSKESOS'] }
    },
    data: { isActive: false }
  });

  console.log("\nDONE! Old roles disabled. Fresh Petugas accounts ready.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
