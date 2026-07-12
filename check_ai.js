const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.systemSetting.findUnique({
    where: { id: 'global_config' }
  });
  console.log(JSON.stringify(config.settings.aiIntegration, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
