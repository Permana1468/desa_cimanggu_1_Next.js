import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = "postgresql://postgres.pifaowosfqnigxkudrcp:Aldyansyah_14@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'rt001.rw001@cimanggu1.desa.id' }
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  const passwords = ["desa123", "Cimanggu123!", "Cimanggu123", "AdminDesa123!", "rt123", "rt001.rw001"];
  for (const pw of passwords) {
    const match = await bcrypt.compare(pw, user.passwordHash || "");
    if (match) {
      console.log(`Password matches: "${pw}"`);
      return;
    }
  }

  console.log("No password matched.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
