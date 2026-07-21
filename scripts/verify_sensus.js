const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'sensus@cimanggu1.desa.id' },
      include: { tenant: true }
    });
    
    if (user) {
      console.log("User Found:");
      console.log("Email:", user.email);
      console.log("Role:", user.role);
      console.log("IsActive:", user.isActive);
      console.log("Tenant:", user.tenant?.name);
      console.log("TenantId:", user.tenantId);
    } else {
      console.log("User NOT FOUND!");
    }
  } catch (err) {
    console.error("Query Error:", err);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
