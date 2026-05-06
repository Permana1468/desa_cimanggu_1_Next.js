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
  const tenantId = 'f93e947c-1a9b-47a3-913b-2ea2a4290732'; // CORRECT TENANT ID

  const usersToCreate = [
    {
      email: 'sensus@cimanggu1.desa.id',
      fullName: 'Petugas Sensus Testing',
      role: 'PETUGAS_SENSUS',
    },
    {
      email: 'puskesos@cimanggu1.desa.id',
      fullName: 'Puskesos Testing',
      role: 'PUSKESOS',
    },
    {
      email: 'posyandu@cimanggu1.desa.id',
      fullName: 'Posyandu Testing',
      role: 'POSYANDU',
    },
    {
      email: 'pkk@cimanggu1.desa.id',
      fullName: 'PKK Testing',
      role: 'PKK',
    }
  ];

  console.log("Starting user creation...");

  for (const u of usersToCreate) {
    try {
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: {
          role: u.role as any,
          passwordHash,
          isActive: true,
          tenantId
        },
        create: {
          email: u.email,
          fullName: u.fullName,
          role: u.role as any,
          passwordHash,
          isActive: true,
          tenantId
        }
      });
      console.log(`✅ User created/updated: ${u.email} (${u.role})`);
    } catch (err) {
      console.error(`❌ Failed to create ${u.email}:`, err);
    }
  }

  console.log("\n--- LOGIN CREDENTIALS ---");
  console.log("Password for all: Cimanggu123!");
  console.log("-------------------------");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
