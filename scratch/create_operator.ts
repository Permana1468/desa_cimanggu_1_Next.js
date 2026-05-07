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

  const user = await prisma.user.upsert({
    where: { email: 'operator@cimanggu1.desa.id' },
    update: {
      fullName: 'Operator Desa Cimanggu I',
      role: 'OPERATOR_DESA',
      passwordHash,
      isActive: true,
      tenantId
    },
    create: {
      email: 'operator@cimanggu1.desa.id',
      fullName: 'Operator Desa Cimanggu I',
      role: 'OPERATOR_DESA',
      passwordHash,
      isActive: true,
      tenantId
    }
  });

  console.log(`✅ Operator account created: ${user.email}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
