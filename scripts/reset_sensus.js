const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function reset() {
  const passwordHash = await bcrypt.hash('AdminSensus123!', 10);
  const user = await prisma.user.update({
    where: { email: 'sensus@cimanggu1.desa.id' },
    data: { 
      passwordHash: passwordHash,
      isActive: true 
    }
  });
  console.log("Password reset for:", user.email);
}

reset().catch(console.error).finally(() => prisma.$disconnect());
