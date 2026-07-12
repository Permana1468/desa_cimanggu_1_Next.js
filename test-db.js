const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.pifaowosfqnigxkudrcp:Aldyansyah_14@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const count = await prisma.arsipLaporan.count();
        console.log("Table exists! Count:", count);
    } catch (e) {
        console.error("Error querying table:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
