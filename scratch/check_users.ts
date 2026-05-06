import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['PETUGAS_SENSUS', 'PUSKESOS']
      }
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      tenantId: true
    }
  });

  console.log("Users with Sensus/Puskesos roles:");
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
