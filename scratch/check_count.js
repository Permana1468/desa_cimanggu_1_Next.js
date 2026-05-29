const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const count = await prisma.tenant.count();
  const tenants = await prisma.tenant.findMany();
  console.log("Total Tenants:", count);
  console.log("Tenants:", tenants);
}
check().catch(console.error).finally(() => prisma.$disconnect());
