const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'sensus@cimanggu1.desa.id' }
  });
  console.log("Sensus User Role in DB:", user?.role);
}
check().catch(console.error).finally(() => prisma.$disconnect());
