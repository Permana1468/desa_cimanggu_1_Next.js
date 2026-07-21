import prisma from '../src/lib/prisma'; 
async function main() { 
    try {
        await prisma.dataKependudukan.findUnique({ 
            where: { nik: '1234567890123456' }, 
            include: { tenant: true }
        }); 
        console.log("Success");
    } catch(e) {
        console.error(e);
    }
} 
main();
