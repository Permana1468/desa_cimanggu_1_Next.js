const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const balita = await prisma.posyanduBalita.findMany({
    select: { posyanduName: true }
  });
  console.log(balita);
}
main().catch(console.error).finally(() => prisma.$disconnect());
