const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const config = await prisma.systemSetting.findUnique({
    where: { id: 'global_config' }
  });
  console.log(JSON.stringify(config.settings.aiIntegration, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
