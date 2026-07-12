import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function main() { 
    console.log(await prisma.user.findMany({ select: { id: true, fullName: true, email: true, phoneNumber: true } })); 
} 
main();
