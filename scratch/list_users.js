const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const users = await prisma.user.findMany({
    where: { role: 'ADMIN_MASTER' },
    select: {
      email: true,
      fullName: true,
      role: true,
      isActive: true
    }
  });
  console.log("Master Admins in DB:", users);
}
check().catch(console.error).finally(() => prisma.$disconnect());
