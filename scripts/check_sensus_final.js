const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'sensus@cimanggu1.desa.id' }
  });
  console.log("Sensus User Role in DB:", user?.role);
}
check().catch(console.error).finally(() => prisma.$disconnect());
