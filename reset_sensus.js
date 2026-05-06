const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

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
