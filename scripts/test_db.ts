import prisma from '../src/lib/prisma'; 
async function main() { 
  const u = await prisma.user.findMany({ 
    where: { role: 'KADUS' }, 
    select: { fullName: true, position: true, rw: true, rt: true } 
  }); 
  console.log(u);
  
  const struct = await prisma.systemSetting.findUnique({
    where: { id: 'village_structure' }
  });
  console.log(JSON.stringify(struct?.settings, null, 2));
} 
main();
