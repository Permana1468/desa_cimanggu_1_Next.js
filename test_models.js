const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.systemSetting.findUnique({
    where: { id: 'global_config' }
  });
  const key = config.settings.aiIntegration.apiKey;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main();
