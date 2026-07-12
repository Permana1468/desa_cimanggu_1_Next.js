import prisma from './src/lib/prisma';
async function test() { 
    try { 
        const user = await prisma.dataKependudukan.findUnique({ where: { nik: '123' }}); 
        console.log('OK', user); 
    } catch (e: any) { 
        console.error('MSG:', e.message); 
    } 
} 
test();
