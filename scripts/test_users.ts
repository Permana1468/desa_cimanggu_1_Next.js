import prisma from '../src/lib/prisma'; 
async function main() { 
    console.log(await prisma.user.findMany({ select: { id: true, fullName: true, email: true, phoneNumber: true } })); 
} 
main();
